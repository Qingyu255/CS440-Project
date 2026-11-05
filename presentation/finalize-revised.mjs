import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {slides,notes,team,mainSlideCount,sections,sectionForSlide,refs} from '../presentation/revised-content.mjs';
import {buildRevised} from '../presentation/revised-deck.mjs';
const root=process.cwd(),build=path.join(root,'.build');
const skill=process.env.PRESENTATIONS_SKILL_DIR;
const modules=process.env.NODE_MODULES_DIR;
const {Presentation,PresentationFile}=await import(pathToFileURL(path.join(modules,'@oai/artifact-tool/dist/artifact_tool.mjs')));
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
const requiredNativeTableOwnerSlides=[8,10,14,17,18,19];
const result=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:process.env.RUNTIME_PYTHON,integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),explicitTotalSlideCount:24,requiredNativeTableOwnerSlides,layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit','--validate-bullet-geometry',...requiredNativeTableOwnerSlides.flatMap(n=>['--require-native-table-slide',String(n)])],fontPolicy:{basis:'design',families:['Arial','Courier New']},verifyArtifactToolImport:true,receiptPath:path.join(build,path.basename(final)+'.validation.json')});
await fs.writeFile(path.join(root,'presentation/slide-source.json'),JSON.stringify(slides.map((s,i)=>({slide:i+1,title:s.title,notes:notes(s),core:s.core,section:`${sectionForSlide(i+1).id}: ${sectionForSlide(i+1).title}`,seconds:s.seconds})),null,2));
await fs.writeFile(path.join(build,'handover-content.json'),JSON.stringify({team,refs,mainSlideCount,sections,slides:slides.map((s,i)=>({...s,number:i+1,section:sectionForSlide(i+1)}))},null,2));
const total=slides.slice(0,mainSlideCount).reduce((a,s)=>a+s.seconds,0);
const scriptSections=sections.map(section=>`## Section ${section.id}: ${section.title}\n\nSlides ${section.start}-${section.end}  |  ${Math.floor(section.seconds/60)}:${String(section.seconds%60).padStart(2,'0')}  |  Assigned presenter: ____________________\n\nSection purpose: ${section.purpose}\n\nIncoming handover: ${section.incoming}\n\n`+slides.slice(section.start-1,section.end).map((s,index)=>`### Slide ${section.start+index}: ${s.title}\n\n${notes(s)}\n\nPoint at: ${s.point}\n\nTransition: ${s.transition}`).join('\n\n')+`\n\nSection handover: ${section.outgoing}`).join('\n\n');
await fs.writeFile(path.join(root,'deliverables/Speaker-Script.md'),`# CS440 NoSQL Injections section script\n\n${mainSlideCount} main slides. Planned content: ${Math.floor(total/60)}:${String(total%60).padStart(2,'0')} including the 90-second demo. Choose one presenter for each section, then write the assignments into the blanks below. Allow about 25 seconds for handovers and navigation. Aim for a measured full run of 10:10 to 10:30. These are rehearsal targets, not measured delivery times.\n\n${scriptSections}\n`);
console.log(JSON.stringify({final,slides:24,seconds:total,result}));
