import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
import {slides,notes,team,owner,refs} from '../presentation/revised-content.mjs';
import {buildRevised} from '../presentation/revised-deck.mjs';
const root=process.cwd(),build=path.join(root,'.build');
const skill=process.env.PRESENTATIONS_SKILL_DIR;
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')));
// Materialize local image bytes directly. A live-session proto stores media by host
// reference; importing that JSON alone does not transfer its image byte store.
const p=Presentation.create({slideSize:{width:1280,height:720}});
await buildRevised(p,root);
const candidate=path.join(build,'revised-candidate.pptx');
await (await PresentationFile.exportPptx(p)).save(candidate);
// Optional click reveals are added to the native package before final validation.
if(process.env.REVEAL_PATCH){
 const {spawnSync}=await import('node:child_process');
 const r=spawnSync(process.env.RUNTIME_PYTHON,[path.join(root,'presentation/add-reveals.py'),candidate],{stdio:'inherit'});if(r.status!==0)throw Error('Reveal patch failed');
}
const final=path.join(root,'deliverables',process.env.DECK_FILENAME||'CS440-NoSQL-Injections-Final-Deck.pptx');
const result=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:process.env.RUNTIME_PYTHON,integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),explicitTotalSlideCount:24,requiredNativeTableOwnerSlides:[9,14,17,18,19],layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit','--validate-bullet-geometry',...[9,14,17,18,19].flatMap(n=>['--require-native-table-slide',String(n)])],fontPolicy:{basis:'design',families:['Arial','Courier New']},verifyArtifactToolImport:true,receiptPath:path.join(build,path.basename(final)+'.validation.json')});
await fs.writeFile(path.join(root,'presentation/slide-source.json'),JSON.stringify(slides.map((s,i)=>({slide:i+1,title:s.title,notes:notes(s),core:s.core,owner:i<13?owner(i):'Q&A',seconds:s.seconds})),null,2));
await fs.writeFile(path.join(build,'handover-content.json'),JSON.stringify({team,refs,slides:slides.map((s,i)=>({...s,number:i+1,owner:i<13?owner(i):'All members'}))},null,2));
const total=slides.slice(0,13).reduce((a,s)=>a+s.seconds,0);
await fs.writeFile(path.join(root,'deliverables/Speaker-Script.md'),`# CS440 NoSQL Injections speaker script\n\n13 main slides. Planned content: ${Math.floor(total/60)}:${String(total%60).padStart(2,'0')} including the 90-second demo. Allow about 25 seconds for handovers and navigation. Aim for a measured full run of 10:50 to 11:00. These are rehearsal targets, not measured delivery times.\n\n`+slides.slice(0,13).map((s,i)=>`## Slide ${i+1}: ${s.title}\n\nSpeaker: ${owner(i)}\n\n${notes(s)}\n\nPoint at: ${s.point}\n\nTransition: ${s.transition}`).join('\n\n')+'\n');
console.log(JSON.stringify({final,slides:24,seconds:total,result}));
