import fs from 'node:fs/promises';
import path from 'node:path';
import {slides,team,refs,notes} from './revised-content.mjs';
const C={bg:'#F6F6F2',ink:'#17252C',muted:'#51616A',red:'#AF3047',green:'#087B6D',blue:'#275A80',paleRed:'#FAE7E9',paleGreen:'#E2F1EB',paleBlue:'#E6EEF4',line:'#CCD5D5',white:'#FFFFFF'};
export async function buildRevised(p,root){
 const evidence=JSON.parse(await fs.readFile(path.join(root,'nosql-lab/evidence/results.json'),'utf8'));
 const authored=[];const tableOwners=[];let serial=0,stage=0;
 const t=(s,str,x,y,w,h,size=30,opt={})=>{
  const sh=s.shapes.add({geometry:'textbox',name:`${stage?'reveal'+stage:'text'}-${++serial}`,position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
  sh.text=str;sh.text.style={typeface:opt.mono?'Courier New':'Arial',fontSize:size,color:opt.color||C.ink,bold:!!opt.bold,autoFit:'none',wrap:'square',alignment:opt.align||'left',insets:{top:0,right:0,bottom:0,left:0}};return sh;
 };
 const line=(s,x,y,w,color=C.line)=>s.shapes.add({geometry:'rect',name:`${stage?'reveal'+stage:'line'}-${++serial}`,position:{left:x,top:y,width:w,height:2},fill:color,line:{fill:'none',width:0}});
 const box=(s,str,x,y,w,h,color=C.blue,fill=C.bg,size=27)=>{const b=s.shapes.add({geometry:'rect',name:`${stage?'reveal'+stage:'node'}-${++serial}`,position:{left:x,top:y,width:w,height:h},fill,line:{fill:color,width:2}});b.text=str;b.text.style={typeface:'Arial',fontSize:size,bold:true,color,alignment:'center',verticalAlignment:'middle',insets:{left:12,right:12,top:10,bottom:10},autoFit:'none'};return b;};
 const arr=(s,x,y,w=54,color=C.muted)=>{s.shapes.add({geometry:'rightArrow',name:`${stage?'reveal'+stage:'arrow'}-${++serial}`,position:{left:x,top:y,width:w,height:22},fill:color,line:{fill:'none',width:0}});};
 const label=(s,str,x,y,w=520,color=C.muted)=>t(s,str,x,y,w,34,22,{bold:true,color});
 const take=(s,str,color=C.ink,y=594)=>t(s,str,64,y,1152,58,30,{bold:true,color});
 const image=async(s,name,x,y,w,h)=>{s.images.add({blob:new Uint8Array(await fs.readFile(path.join(root,'nosql-lab/evidence/browser',name))),contentType:'image/png',alt:`Actual local browser result: ${name}`,fit:'contain',position:{left:x,top:y,width:w,height:h}});};
 const tab=(s,values,widths,y=180,h=340,size=25)=>{const tb=s.tables.add({rows:values.length,columns:values[0].length,left:64,top:y,width:1152,height:h,values,columnWidths:widths});tb.cells.block({row:0,column:0,rowCount:values.length,columnCount:values[0].length}).assign({fill:C.bg,textStyle:{typeface:'Arial',fontSize:size,color:C.ink},margins:{left:14,right:14,top:8,bottom:8},anchor:'center'});for(let j=0;j<values[0].length;j++){tb.getCell(0,j).fill=C.ink;tb.getCell(0,j).text.style={typeface:'Arial',fontSize:size,bold:true,color:C.white};}tb.borders.assign({fill:C.line,width:1,style:'solid'});tableOwners.push(authored.length);return tb;};
 const node=(s,num,heading,body,x,y,w=220,color=C.blue)=>{t(s,num,x,y,w,44,34,{color,bold:true});line(s,x,y+57,w,color);t(s,heading,x,y+80,w,82,29,{bold:true,color});t(s,body,x,y+173,w,100,25);};
 for(let i=0;i<slides.length;i++){
  const d=slides[i],s=p.slides.add(),dark=i===0||i===12;
  stage=0;s.background.fill=dark?C.ink:C.bg;s.speakerNotes.textFrame.setText(notes(d));authored.push({slide:s,...d});
  t(s,d.title,64,44,1152,94,i===0?46:41,{bold:true,color:dark?C.white:C.ink});
  t(s,String(i+1).padStart(2,'0'),1164,672,52,28,19,{color:dark?'#BAC8CC':C.muted});
  const foot=i<13?['Ron et al., 2016 / controlled local reproduction','MongoDB 7.0 $ne documentation / illustrative teaching record','Threat model / local synthetic records','Ron et al., 2016 / author manuscript and republication','C04 / native MongoDB driver / synthetic plaintext reproduction','C04 object and C06 string controls','15 cases × 5 configurations × 2 runs / results.json','Actual browser captures / local synthetic lab / 1 November 2026','Focal attack C04 / complete matrix in slides 17–18','Local source / OWASP NoSQL and password-storage guidance','Literature comparison / MongoDB 7.0 $where documentation','Recorded local experiment / results.json and results.csv','Proposed follow-up study / OWASP NoSQL guidance'][i]:'';
  if(foot)t(s,foot,64,671,1060,30,16,{color:dark?'#BAC8CC':C.muted});
  switch(d.layout){
  case 'cover':
   t(s,'A login without\nthe password',64,190,1090,165,64,{bold:true,color:C.white});
   t(s,'"password": "wrong"',64,405,550,56,31,{mono:true,color:'#BAC8CC'});arr(s,618,416,60,'#BAC8CC');
   t(s,'{ "$ne": "" }',730,405,450,56,35,{mono:true,color:'#F4A5B0'});
   t(s,'A controlled comparison of five login configurations',64,499,1100,56,28,{color:'#BAC8CC'});
   t(s,team.join('  /  '),64,585,1115,54,22,{color:C.white});break;
  case 'primer':
   label(s,'DOCUMENT = A STORED RECORD',64,158);
   t(s,'{ username: "alice", password: "…" }',64,201,1152,56,32,{mono:true});
   t(s,'Alice’s stored password is a non-empty string in the vulnerable lab.',64,263,1152,45,24,{color:C.muted});
   line(s,64,325,1152);
   label(s,'EQUALITY CONDITION',64,355,530,C.blue);
   t(s,'password: "wrong"',64,405,535,60,32,{mono:true,color:C.blue});
   t(s,'Does the password equal “wrong”?',64,477,535,76,27);
   label(s,'OPERATOR CONDITION',674,355,540,C.red);
   t(s,'password: { $ne: "" }',674,405,540,60,31,{mono:true,color:C.red});
   t(s,'Is the password different from an empty string?',674,477,540,76,27);
   take(s,'Predicate = condition     $ne = not equal     "" = empty string',C.ink,570);
   t(s,'NoSQL models: document, key-value, graph, wide-column. Here: MongoDB documents.',64,638,1152,30,20,{color:C.muted});break;
  case 'flow':{
   const xs=[64,302,540,778,1016];const heads=['Client','Application','MongoDB','Session','Private notes'];const sub=['Sends JSON','Builds query','Returns Alice','Remembers Alice','Allows access'];
   for(let n=0;n<5;n++){box(s,heads[n],xs[n],215,200,90,n===0||n>2?C.red:C.blue);t(s,sub[n],xs[n],335,200,80,24);if(n<4)arr(s,xs[n]+205,248,28);}
   label(s,'THE ATTACKER CONTROLS THE REQUEST',64,161,1100,C.red);
   t(s,'The failure occurs when input changes the query condition.',64,452,1145,66,32,{bold:true,color:C.red});
   t(s,'Known username, no direct database access, no changes to stored records',64,541,1145,60,25);
   break;}
  case 'landscape':{
   label(s,'INPUT ENTERS…',64,158);label(s,'WHAT CAN CHANGE',614,158);
   const rows=[['Query conditions','Operator object changes a condition','Tautologies / our experiment',C.red],['Query text','Added logic changes which records match','“Union queries” / literature',C.muted],['JavaScript source','String becomes executable source','JavaScript injection / comparison',C.blue],['A protocol command','A separator introduces another command','Piggybacked queries / literature',C.muted],['A trusted browser','Browser sends an unwanted action','Origin violation / CSRF / adjacent issue',C.muted]];
   rows.forEach(([a,b,c,color],j)=>{const y=207+j*77;t(s,a,64,y,450,40,28,{bold:true,color});arr(s,527,y+7,45,color);t(s,b,614,y,595,35,25,{color});t(s,c,614,y+34,595,32,18,{color:C.muted});});
   take(s,'Which controls stop the highlighted operator route?',C.red,607);break;}
  case 'mechanism':
   label(s,'1  CLIENT REQUEST',64,159,1130,C.red);
   t(s,'{"username":"alice","password":{"$ne":""}}',64,207,1152,60,31,{mono:true,color:C.red});
   stage=1;label(s,'2  APPLICATION COPIES THE VALUES',64,302,620,C.blue);
   t(s,'users.findOne({\n  username: body.username,\n  password: body.password\n})',64,352,650,175,28,{mono:true});
   stage=2;label(s,'3  BOTH CONDITIONS MATCH',760,302,450,C.red);
   t(s,'username equals Alice\nAND\npassword is not ""',760,352,450,145,29,{bold:true,color:C.red});
   stage=3;take(s,'A match becomes a session without password proof.',C.red,568);
   t(s,'For this record, the stored password is non-empty. $ne: "" also matches missing fields.',64,629,1140,35,19,{color:C.muted});stage=0;break;
  case 'types':
   label(s,'OBJECT',64,174,1152,C.red);t(s,'{ "$ne": "" }',64,230,420,70,35,{mono:true,color:C.red});arr(s,500,251,70,C.red);box(s,'MongoDB operator',604,209,320,103,C.red,C.paleRed);t(s,'CONDITION TRUE\nDatabase returns Alice',970,218,246,96,25,{bold:true,color:C.red});
   line(s,64,359,1152);
   label(s,'STRING',64,399,1152,C.blue);t(s,'"{\\"$ne\\":\\"\\"}"',64,454,460,74,31,{mono:true,color:C.blue});arr(s,500,475,70,C.blue);box(s,'Literal text',604,433,320,103,C.blue,C.paleBlue);t(s,'CONDITION FALSE\nLogin rejected',970,442,246,96,25,{bold:true,color:C.blue});
   take(s,'The parsed input type changes what the query means.',C.ink,586);break;
  case 'experiment':
   t(s,'15 cases',64,168,280,68,43,{bold:true});t(s,'Correct / wrong passwords\nOperator objects\nUnexpected types and fields',64,255,300,145,26);
   arr(s,378,285,55,C.blue);
   label(s,'5 CONFIGURATIONS',467,161,400,C.blue);
   ['Baseline','JavaScript disabled','Read-only DB account','String validation','Full hardened login'].forEach((v,j)=>{t(s,v,467,215+j*54,344,43,26,{color:j>2?C.green:C.ink});});
   arr(s,827,285,55,C.blue);label(s,'2 RUNS',920,161,290,C.blue);
   t(s,'Login decision\nProtected access\nQuery count',920,239,295,160,28);
   line(s,64,525,1152);t(s,'150 recorded case results',64,555,590,60,37,{bold:true,color:C.blue});t(s,'Control probes verify settings.\nRepeated runs show local repeatability.',695,548,520,90,23,{color:C.muted});break;
  case 'demo':{
   const x=[64,359,654,949],titles=['Wrong password','Attack payload','Same attack after fix','Correct password'];const outcomes=['Login rejected','Attack succeeds\nLogged in as Alice','Attack stopped\nNo database query','Legitimate login\nworks'];
   for(let n=0;n<4;n++){label(s,String(n+1).padStart(2,'0'),x[n],159,250,n===1?C.red:C.blue);t(s,titles[n],x[n],207,260,78,27,{bold:true});t(s,outcomes[n],x[n],292,260,78,23,{color:n===1?C.red:C.green,bold:true});}
   label(s,'CAPTURED ATTACK SUCCESS',64,381,550,C.red);label(s,'CAPTURED ATTACK REJECTION',664,381,550,C.green);
   await image(s,'fresh-02-decision.png',64,420,552,213);await image(s,'fresh-03-decision.png',664,420,552,213);
   const link=t(s,'Live lab: http://127.0.0.1:4400     Offline video: 90 seconds',64,643,1110,26,18,{color:C.blue});link.text.get('http://127.0.0.1:4400').link={uri:'http://127.0.0.1:4400',isExternal:true};break;}
  case 'results':{
   const vals=[['Configuration','Attack outcome','Database query','Correct login']];
   for(const [mode,name] of [['baseline','Baseline'],['noscripting','JavaScript disabled'],['readonly','Read-only DB account'],['validated','String validation'],['hardened','Full hardened login']]){const r=evidence.results.find(a=>a.configuration===mode&&a.caseId==='C04');const v=evidence.results.find(a=>a.configuration===mode&&a.caseId==='C01');if(!r||v.status!==200)throw Error('Evidence mismatch');vals.push([name,r.status===200?'Attack succeeds (200)':'Attack stopped (400)',r.findCommands?'1 query sent':'No query sent','Login works (200)']);}
   const tb=tab(s,vals,[360,315,225,252],164,356,22);
   for(let n=1;n<6;n++){tb.getCell(n,1).fill=n<4?C.paleRed:C.paleGreen;tb.getCell(n,1).text.style={fontSize:22,typeface:'Arial',bold:true,color:n<4?C.red:C.green};tb.getCell(n,3).fill=C.paleGreen;}
   t(s,'Disabling scripting does not affect this query operator.\nRead-only access still permits the one read needed by the attack.',64,547,1152,90,26);
   break;}
  case 'fix':
   label(s,'WHY THE ATTACK FAILS',64,159,1100,C.green);t(s,'The password object is not text, so the app rejects it before MongoDB sees it.',64,205,1140,72,31,{bold:true,color:C.green});line(s,64,295,1152);
   label(s,'SAFE LOGIN FLOW',64,326,1150,C.blue);
   ['Accept text only','Find the account','Check the password','Create a session'].forEach((v,j)=>{stage=j+1;node(s,'0'+(j+1),v,['Username and password\nmust be non-empty text','MongoDB uses the\nusername only','App compares the input\nwith the stored hash','Only if the\npassword matches'][j],64+j*300,382,240,j===3?C.green:C.blue);if(j<3)arr(s,313+j*300,466,38,C.blue);});stage=0;break;
  case 'interpreters':
   label(s,'MEASURED IN OUR LAB',64,158,1100,C.red);
   box(s,'Object contains\n$ne',64,214,310,85,C.red,C.paleRed,25);arr(s,395,246,54,C.red);box(s,'MongoDB reads a\nquery condition',473,214,315,85,C.red,C.bg,24);arr(s,809,246,54,C.red);t(s,'Changes which\nrecords match',890,220,325,80,26,{bold:true,color:C.red});
   t(s,'Control: for login fields, accept text only and build the query in application code.',64,322,1152,65,26);
   line(s,64,406,1152);label(s,'LITERATURE COMPARISON',64,436,1100,C.blue);
   box(s,'Text inserted into\nJavaScript source',64,483,310,85,C.blue,C.paleBlue,24);arr(s,395,516,54,C.blue);box(s,'JavaScript engine\nexecutes the source',473,483,315,85,C.blue,C.bg,24);arr(s,809,516,54,C.blue);t(s,'Changes program\nlogic',890,489,325,80,26,{bold:true,color:C.blue});
   t(s,'Control: do not build code from user text; disable unused scripting.',64,594,1152,40,26);
   t(s,'We measured the first row. The fixed $where probe checked the server setting only.',64,637,1152,30,19,{color:C.muted});break;
  case 'findings':{
   const content=[['1','The attack succeeds','Operator object logs the attacker in as Alice','Session created\nHTTP 200',C.red],['2','The attack is stopped','Object rejected before MongoDB receives a query','No query sent\nHTTP 400',C.green],['3','Legitimate login still works','Correct credentials retain protected access','Access granted\nHTTP 200',C.blue]];
   content.forEach(([n,a,b,c,col],j)=>{const y=173+j*141;t(s,n,64,y,65,65,43,{bold:true,color:col});t(s,a,160,y,782,48,32,{bold:true});t(s,b,160,y+61,790,48,25,{color:C.muted});t(s,c,970,y+6,246,78,25,{bold:true,color:col});if(j<2)line(s,160,y+116,1056);});
   t(s,'Scope: one recorded stack, synthetic accounts and 15 request cases.',64,617,1152,40,24,{color:C.muted});break;}
  case 'conclusion':
   t(s,'Choose the query structure.\nValidate values. Verify the password.',64,171,1152,143,45,{bold:true,color:C.white});
   t(s,'NEXT QUESTION',64,364,1152,36,23,{bold:true,color:'#BAC8CC'});
   t(s,'How can flexible search preserve customer separation?',64,415,1152,78,32,{bold:true,color:C.white});
   box(s,'User-selected filter',64,530,390,73,'#BAC8CC',C.ink,27);t(s,'+',484,541,60,50,35,{color:C.white,bold:true});box(s,'Mandatory tenant rule',570,530,464,73,'#9FD3C7',C.ink,27);
   t(s,'Proposed test: allowed filters vs a builder that always adds the tenant rule.',64,628,1152,32,20,{color:'#BAC8CC'});break;
  case 'environment':
   tab(s,[['Component','Recorded value'],['MongoDB',evidence.environment.database],['Node.js',evidence.environment.node],['Express / native driver','5.1.0 / 6.20.0'],['Transport / parser','Loopback HTTP / JSON / express.json'],['Password verification','scrypt N=131072, r=8, p=1'],['Evidence','15 cases × 5 modes × 2 runs']],[440,712],165,403,25);
   t(s,'Original experiment record. Fresh browser captures: 1 November 2026.',64,606,1152,45,23,{color:C.muted});break;
  case 'vulnerable':
   label(s,'CLIENT VALUES ENTER THE QUERY',64,166,1152,C.red);
   t(s,'const filter = {\n  username: req.body.username,\n  password: req.body.password\n};\nconst account = await users.findOne(filter);',64,217,1152,241,29,{mono:true});
   line(s,64,487,1152,C.red);t(s,'if (account) createSession(account);',64,524,1152,58,33,{mono:true,color:C.red,bold:true});
   t(s,'Condensed vulnerable excerpt. A match is incorrectly accepted as password proof.',64,613,1152,48,24);break;
  case 'hardened':{
   const code=[['1','Validate exactly two non-empty strings','if (!validContract(body)) return reject(400);'],['2','Look up by username only','const account = await users.findOne({ username });'],['3','Verify a salted password hash','const ok = await verifyPassword(password, storedHash);'],['4','Create a session after verification','if (account && ok) createSession(account);']];
   code.forEach(([n,a,b],j)=>{const y=166+j*119;t(s,n,64,y,55,58,39,{bold:true,color:C.green});label(s,a,152,y,1064,C.green);t(s,b,152,y+47,1064,53,27,{mono:true});});
   t(s,'Condensed code. Full source includes field/length checks and a dummy hash for unknown users.',64,665,1060,32,16,{color:C.muted});break;}
  case 'cases1':case 'cases2':{
   const start=d.layout==='cases1'?0:8,end=d.layout==='cases1'?8:15;
   const rs=evidence.results.filter(r=>r.configuration==='baseline'&&r.repetition===1).slice(start,end);
   const outcome=(status,id,fixed=false)=>status===200?(id==='C01'?'Login succeeds':(['C04','C13'].includes(id)?'Attack succeeds':'Request accepted')):status===401?'Login rejected':fixed?'Stopped before query':'Request rejected';
   const vals=[['Case','Request shape','Three vulnerable modes','Protected modes']];
   rs.forEach(r=>{const fixed=evidence.results.find(q=>q.caseId===r.caseId&&q.configuration==='hardened'&&q.repetition===1);vals.push([r.caseId,r.case,outcome(r.status,r.caseId),outcome(fixed.status,r.caseId,true)]);});
   const tb=tab(s,vals,[98,454,300,300],160,428,20);
   rs.forEach((r,j)=>{if(['C04','C13'].includes(r.caseId))tb.getCell(j+1,2).fill=C.paleRed;if(evidence.results.find(q=>q.caseId===r.caseId&&q.configuration==='hardened'&&q.repetition===1).status===400)tb.getCell(j+1,3).fill=C.paleGreen;});
   t(s,'Vulnerable modes: baseline, scripting disabled and read-only. Both runs agree.',64,612,1152,37,21,{color:C.muted});
   t(s,'HTTP codes are secondary evidence: 200 accepted, 401 login rejected, 400 stopped before query.',64,651,1080,30,17,{color:C.muted});break;}
  case 'probes':
   tab(s,[['Control','Independent observation'],['Read-only identity','Authenticated as labreader with the read role'],['Read permitted','Alice lookup succeeds'],['Write denied','MongoDB blocks the write (error 13)'],['Scripting enabled','The fixed $where probe returns Alice'],['Scripting disabled','The same probe fails as expected (error 6108304)']],[423,729],177,377,24);
   take(s,'Both controls are active, but neither stops attack C04.',C.red,591);
   t(s,'The fixed $where expression tests configuration, not attacker-controlled JavaScript.',64,651,1080,30,18,{color:C.muted});break;
  case 'capture1':case 'capture2':{
   const attack=d.layout==='capture1',col=attack?C.red:C.green;
   label(s,attack?'VULNERABLE LOGIN':'HARDENED LOGIN',64,155,1152,col);
   t(s,'{"username":"alice","password":{"$ne":""}}',64,203,1152,61,30,{mono:true,color:col});
   label(s,'SAME ATTACK REQUEST AND ACTUAL RESPONSE',64,294,1152,C.muted);
   await image(s,attack?'fresh-02-evidence.png':'fresh-03-evidence.png',64,333,1152,320);
   break;}
  case 'limits':
   label(s,'ESTABLISHED',64,179,540,C.green);label(s,'NOT ESTABLISHED',704,179,510,C.muted);
   t(s,'This operator attack succeeds\nBehaviour of five configurations\nRejection before a find query\nPreservation of correct login',64,243,555,270,30);
   t(s,'A JavaScript exploit\nReal-world prevalence\nAll drivers or DB versions\nAdministrator access\nComplete production security',704,243,510,300,30);
   take(s,'Next experiment: permitted search without cross-tenant access.',C.ink,596);break;
  case 'references1':
   t(s,'Ron, Shulman-Peleg and Puzanov (2016)\nAnalysis and Mitigation of NoSQL Injections\nIEEE Security & Privacy 14(2), 30–39',64,170,1152,144,31);
   t(s,'DOI: 10.1109/MSP.2016.36',64,332,1152,52,29,{color:C.blue});
   t(s,'Author-uploaded manuscript and authors’ InfoQ republication\nOriginal classes: tautologies, union queries, JavaScript injection,\npiggybacked queries and origin violation.',64,418,1152,115,26);
   t(s,'MongoDB 7.0: $ne and $where documentation\nFull URLs in the notes and team guide.',64,568,1152,80,25,{color:C.muted});break;
  case 'references2':{
   t(s,'OWASP NoSQL Security Cheat Sheet\nOWASP Password Storage Cheat Sheet',64,170,1152,99,29);
   const repo=t(s,'github.com/Qingyu255/CS440-Project',64,318,930,60,32,{color:C.blue,bold:true});repo.text.get('github.com/Qingyu255/CS440-Project').link={uri:'https://github.com/Qingyu255/CS440-Project',isExternal:true};
   t(s,'Evidence commit: c8252d2\nSource and results are fixed at this revision.',64,397,900,90,27);
   t(s,'results.json / results.csv / server.mjs / experiment.mjs\nFresh captures and team guide accompany the revised deck.',64,524,1140,100,24,{color:C.muted});
   try{const qr=await fs.readFile(path.join(root,'presentation/assets/evidence-qr.png'));s.images.add({blob:new Uint8Array(qr),contentType:'image/png',alt:'QR link to the immutable evidence commit',position:{left:1024,top:385,width:176,height:176},fit:'contain'});}catch{}
   break;}
  }
 }
 return {authored,tableOwners};
}
