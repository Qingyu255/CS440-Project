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
 const panel=(s,x,y,w,h,fill=C.white,stroke=C.line,strokeWidth=1)=>s.shapes.add({geometry:'rect',name:`${stage?'reveal'+stage:'panel'}-${++serial}`,position:{left:x,top:y,width:w,height:h},fill,line:{fill:stroke,width:strokeWidth}});
 const vline=(s,x,y,h,color=C.line)=>s.shapes.add({geometry:'rect',name:`${stage?'reveal'+stage:'vline'}-${++serial}`,position:{left:x,top:y,width:2,height:h},fill:color,line:{fill:'none',width:0}});
 const box=(s,str,x,y,w,h,color=C.blue,fill=C.bg,size=27)=>{const b=s.shapes.add({geometry:'rect',name:`${stage?'reveal'+stage:'node'}-${++serial}`,position:{left:x,top:y,width:w,height:h},fill,line:{fill:color,width:2}});b.text=str;b.text.style={typeface:'Arial',fontSize:size,bold:true,color,alignment:'center',verticalAlignment:'middle',insets:{left:12,right:12,top:10,bottom:10},autoFit:'none'};return b;};
 const arr=(s,x,y,w=54,color=C.muted)=>{s.shapes.add({geometry:'rightArrow',name:`${stage?'reveal'+stage:'arrow'}-${++serial}`,position:{left:x,top:y,width:w,height:22},fill:color,line:{fill:'none',width:0}});};
 const downArr=(s,x,y,h=48,color=C.muted)=>{s.shapes.add({geometry:'downArrow',name:`${stage?'reveal'+stage:'down-arrow'}-${++serial}`,position:{left:x,top:y,width:22,height:h},fill:color,line:{fill:'none',width:0}});};
 const label=(s,str,x,y,w=520,color=C.muted)=>t(s,str,x,y,w,34,22,{bold:true,color});
 const take=(s,str,color=C.ink,y=594)=>t(s,str,64,y,1152,58,30,{bold:true,color});
 const image=async(s,name,x,y,w,h)=>{s.images.add({blob:new Uint8Array(await fs.readFile(path.join(root,'nosql-lab/evidence/browser',name))),contentType:'image/png',alt:`Actual local browser result: ${name}`,fit:'contain',position:{left:x,top:y,width:w,height:h}});};
 const tab=(s,values,widths,y=180,h=340,size=25)=>{const tb=s.tables.add({rows:values.length,columns:values[0].length,left:64,top:y,width:1152,height:h,values,columnWidths:widths});tb.cells.block({row:0,column:0,rowCount:values.length,columnCount:values[0].length}).assign({fill:C.bg,textStyle:{typeface:'Arial',fontSize:size,color:C.ink},margins:{left:14,right:14,top:8,bottom:8},anchor:'center'});for(let j=0;j<values[0].length;j++){tb.getCell(0,j).fill=C.ink;tb.getCell(0,j).text.style={typeface:'Arial',fontSize:size,bold:true,color:C.white};}tb.borders.assign({fill:C.line,width:1,style:'solid'});tableOwners.push(authored.length);return tb;};
 const node=(s,num,heading,body,x,y,w=220,color=C.blue)=>{t(s,num,x,y,w,44,34,{color,bold:true});line(s,x,y+57,w,color);t(s,heading,x,y+80,w,82,29,{bold:true,color});t(s,body,x,y+173,w,100,25);};
 const assetImage=async(s,name,alt,x,y,w,h,fit='cover')=>{s.images.add({blob:new Uint8Array(await fs.readFile(path.join(root,'presentation/assets',name))),contentType:'image/png',alt,fit,position:{left:x,top:y,width:w,height:h}});};
 for(let i=0;i<slides.length;i++){
  const d=slides[i],s=p.slides.add(),dark=i===0||i===12;
  stage=0;s.background.fill=dark?C.ink:C.bg;s.speakerNotes.textFrame.setText(notes(d));authored.push({slide:s,...d});
  if(i===0)await assetImage(s,'nosql-cover-hero-v2.png','Conceptual illustration of a document database authentication bypass',0,0,1280,720);
  if(i===12)await assetImage(s,'query-control-future-work-v2.png','Conceptual illustration of fixed query policy preserving separated data',0,0,1280,720);
  t(s,d.title,64,44,i===0?520:i===12?590:1152,94,i===0?28:i===12?38:41,{bold:true,color:dark?C.white:C.ink});
  t(s,String(i+1).padStart(2,'0'),1164,672,52,28,19,{color:dark?'#BAC8CC':C.muted});
  const foot=i<13?['Ron et al., 2016 / controlled local reproduction','MongoDB 7.0 $ne documentation / illustrative teaching record','Threat model / local synthetic records','Ron et al., 2016 / author manuscript and republication','C04 / native MongoDB driver / synthetic plaintext reproduction','C04 object and C06 string controls','15 cases × 5 configurations × 2 runs / results.json','Actual browser captures / local synthetic lab / 1 November 2026','Focal attack C04 / complete matrix in slides 17–18','Local source / OWASP NoSQL and password-storage guidance','Literature comparison / MongoDB 7.0 $where documentation','Recorded local experiment / results.json and results.csv','Proposed follow-up study / OWASP NoSQL guidance'][i]:'';
  if(foot)t(s,foot,64,671,1060,30,16,{color:dark?'#BAC8CC':C.muted});
  switch(d.layout){
  case 'cover':
   t(s,'A login without\nthe password',64,154,535,170,62,{bold:true,color:C.white});
   panel(s,64,362,520,132,'#0E202A','#39515D',1);
   t(s,'ATTACK PAYLOAD',84,382,470,28,18,{bold:true,color:'#BAC8CC'});
   t(s,'{ "password": { "$ne": "" } }',84,423,470,46,25,{mono:true,color:'#F4A5B0',bold:true});
   t(s,'One object changes the meaning of the login query.',84,470,470,30,20,{color:C.white});
   t(s,'Controlled experiment across five login configurations',64,526,535,62,22,{color:'#BAC8CC'});
   t(s,team.join('  /  '),64,604,565,36,19,{color:C.white});break;
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
   label(s,'THE TRUST BOUNDARY',64,153,1100,C.red);
   panel(s,64,199,300,190,C.paleRed,C.red,2);
   t(s,'01',84,219,70,45,32,{bold:true,color:C.red});
   t(s,'Attacker controls\nthe request',84,270,250,61,25,{bold:true,color:C.red});
   t(s,'Knows "alice" and controls\nthe JSON body',84,336,250,48,19);
   arr(s,390,277,48,C.red);
   panel(s,464,199,342,190,C.white,C.red,3);
   t(s,'02  APPLICATION',486,219,290,38,23,{bold:true,color:C.red});
   t(s,'Copies request values\ninto the query',486,273,290,68,27,{bold:true});
   t(s,'The client changes what the password check means.',486,350,290,38,17,{color:C.muted});
   arr(s,832,277,48,C.blue);
   panel(s,906,199,310,190,C.paleBlue,C.blue,2);
   t(s,'03  MONGODB',928,219,260,38,23,{bold:true,color:C.blue});
   t(s,'Returns Alice',928,284,260,44,32,{bold:true,color:C.blue});
   t(s,'The query condition is true for the stored record.',928,341,260,42,19,{color:C.muted});
   t(s,'A database match is not password proof.',64,439,1152,58,39,{bold:true,color:C.red});
   line(s,64,510,1152,C.red);
   t(s,'Session created',64,545,280,42,29,{bold:true,color:C.red});arr(s,355,553,58,C.red);
   t(s,'Alice remembered as the user',442,545,390,42,29,{bold:true});arr(s,838,553,58,C.red);
   t(s,'Private notes exposed',925,545,291,42,29,{bold:true,color:C.red});
   t(s,'Threat model: no direct database access and no modification of stored records.',64,621,1152,31,20,{color:C.muted});
   break;}
  case 'landscape':{
   label(s,'OUR MEASURED ROUTE',64,154,1100,C.red);
   panel(s,64,199,1152,151,C.paleRed,C.red,2);
   t(s,'Query condition',91,230,268,48,30,{bold:true,color:C.red});arr(s,369,241,58,C.red);
   t(s,'Operator object changes the condition',459,230,360,70,29,{bold:true,color:C.red});arr(s,830,241,58,C.red);
   t(s,'A different record can match',920,230,265,70,29,{bold:true,color:C.red});
   t(s,'Tautology-style operator injection in our experiment',91,307,1040,29,19,{color:C.muted});
   label(s,'OTHER BOUNDARIES DISCUSSED IN THE PAPER',64,389,1100,C.blue);
   const others=[['Query text','Added logic changes matching records'],['JavaScript source','Input becomes executable code'],['Protocol command','A separator adds a command'],['Trusted browser','CSRF uses a user’s authority']];
   others.forEach(([a,b],j)=>{const x=64+j*288;t(s,a,x,444,258,38,25,{bold:true,color:j===1?C.blue:C.ink});line(s,x,489,245,j===1?C.blue:C.line);t(s,b,x,507,252,75,21,{color:C.muted});});
   take(s,'The rest of the talk tests which controls stop the operator route.',C.red,594);break;}
  case 'mechanism':
   stage=1;panel(s,64,173,326,355,C.paleRed,C.red,2);t(s,'01  CLIENT REQUEST',86,195,280,36,21,{bold:true,color:C.red});
   t(s,'username',86,263,250,28,18,{color:C.muted});t(s,'"alice"',86,296,260,42,29,{mono:true});
   t(s,'password',86,369,250,28,18,{color:C.muted});t(s,'{ "$ne": "" }',86,403,270,48,31,{mono:true,color:C.red,bold:true});
   t(s,'The value is an object.',86,472,270,31,20,{color:C.red,bold:true});
   stage=2;arr(s,410,337,46,C.red);panel(s,477,173,388,355,C.white,C.blue,2);t(s,'02  VULNERABLE APPLICATION',499,195,344,36,21,{bold:true,color:C.blue});
   t(s,'users.findOne({',499,262,320,30,22,{mono:true});t(s,'  username: body.username,',499,302,340,30,19,{mono:true});t(s,'  password: body.password',499,342,340,30,19,{mono:true,color:C.red,bold:true});t(s,'})',499,382,320,30,22,{mono:true});
   line(s,499,426,320,C.blue);t(s,'The app lets the request define\nthe password condition.',499,450,330,62,21,{bold:true});
   stage=3;arr(s,885,337,46,C.red);panel(s,952,173,264,355,C.paleRed,C.red,2);t(s,'03  DATABASE',974,195,220,36,21,{bold:true,color:C.red});
   t(s,'username\nequals Alice',974,263,220,72,27,{bold:true});t(s,'AND',974,351,220,30,21,{color:C.muted,align:'center'});t(s,'password\nis not empty',974,395,220,78,28,{bold:true,color:C.red});t(s,'MATCH',974,486,220,31,24,{bold:true,color:C.red,align:'center'});
   stage=4;take(s,'The client changed the meaning of the password check.',C.red,565);
   t(s,'For this synthetic record, the stored password is non-empty. $ne: "" also matches missing fields.',64,629,1140,35,19,{color:C.muted});stage=0;break;
  case 'types':
   panel(s,64,170,544,390,C.paleRed,C.red,2);panel(s,672,170,544,390,C.paleBlue,C.blue,2);
   label(s,'OBJECT',91,198,480,C.red);t(s,'{ "$ne": "" }',91,253,470,59,35,{mono:true,color:C.red,bold:true});line(s,91,333,470,C.red);
   t(s,'MongoDB sees',91,361,470,30,20,{color:C.muted});t(s,'an operator condition',91,399,470,46,29,{bold:true,color:C.red});t(s,'Alice matches',91,479,470,43,31,{bold:true,color:C.red});
   label(s,'STRING',699,198,480,C.blue);t(s,'"{\\"$ne\\":\\"\\"}"',699,253,470,59,31,{mono:true,color:C.blue,bold:true});line(s,699,333,470,C.blue);
   t(s,'MongoDB sees',699,361,470,30,20,{color:C.muted});t(s,'ordinary literal text',699,399,470,46,29,{bold:true,color:C.blue});t(s,'Alice does not match',699,479,470,43,31,{bold:true,color:C.blue});
   t(s,'Same characters. Different parsed types. Different query meaning.',64,596,1152,44,30,{bold:true,align:'center'});break;
  case 'experiment':
   t(s,'15',64,174,170,85,65,{bold:true,color:C.ink});t(s,'CASES',64,267,170,33,20,{bold:true,color:C.muted});
   t(s,'×',247,188,74,70,48,{bold:true,color:C.muted,align:'center'});
   t(s,'5',338,174,170,85,65,{bold:true,color:C.blue});t(s,'CONFIGURATIONS',338,267,220,33,20,{bold:true,color:C.blue});
   t(s,'×',578,188,74,70,48,{bold:true,color:C.muted,align:'center'});
   t(s,'2',670,174,150,85,65,{bold:true,color:C.ink});t(s,'RUNS',670,267,150,33,20,{bold:true,color:C.muted});
   t(s,'=',831,188,74,70,48,{bold:true,color:C.muted,align:'center'});
   t(s,'150',922,174,250,85,65,{bold:true,color:C.green});t(s,'RECORDED RESULTS',922,267,250,33,20,{bold:true,color:C.green});
   line(s,64,335,1152);
   label(s,'FOR EVERY REQUEST, WE RECORDED',64,372,1100,C.blue);
   t(s,'Login decision',64,430,330,48,31,{bold:true});t(s,'Did the app create a session?',64,482,330,43,22,{color:C.muted});
   vline(s,426,423,112);t(s,'Protected access',466,430,330,48,31,{bold:true});t(s,'Could the caller open Alice’s notes?',466,482,330,43,22,{color:C.muted});
   vline(s,828,423,112);t(s,'Database query count',868,430,348,48,31,{bold:true});t(s,'Did MongoDB receive a find command?',868,482,348,43,22,{color:C.muted});
   panel(s,64,559,1152,69,C.paleBlue,C.blue,1);t(s,'Independent probes verify the control settings. Repeated runs show local repeatability.',88,578,1104,31,22,{color:C.blue,bold:true});break;
  case 'demo':{
   label(s,'FOUR DEMO CHECKS',64,151,1100,C.blue);
   const x=[64,352,640,928],titles=['Wrong password','Operator object','After the fix','Correct password'];const outcomes=['Login rejected','Attack succeeds','Same attack stopped','Login works'];
   for(let n=0;n<4;n++){t(s,String(n+1).padStart(2,'0'),x[n],198,52,35,23,{bold:true,color:n===1?C.red:n>1?C.green:C.blue});t(s,titles[n],x[n]+48,198,222,35,23,{bold:true});t(s,outcomes[n],x[n]+48,241,222,34,20,{color:n===1?C.red:n>1?C.green:C.muted,bold:true});if(n<3)vline(s,x[n]+272,192,86);}
   line(s,64,306,1152);
   label(s,'ATTACK SUCCEEDS',64,336,550,C.red);label(s,'SAME ATTACK IS STOPPED',664,336,550,C.green);
   await image(s,'fresh-02-evidence.png',64,375,552,224);await image(s,'fresh-03-evidence.png',664,375,552,224);
   const link=t(s,'Live lab: http://127.0.0.1:4400     Offline video: 90 seconds',64,643,1110,26,18,{color:C.blue});link.text.get('http://127.0.0.1:4400').link={uri:'http://127.0.0.1:4400',isExternal:true};break;}
  case 'results':{
   const vals=[['Configuration','Attack outcome','Database query','Correct login']];
   for(const [mode,name] of [['baseline','Baseline'],['noscripting','JavaScript disabled'],['readonly','Read-only DB account'],['validated','String validation'],['hardened','Full hardened login']]){const r=evidence.results.find(a=>a.configuration===mode&&a.caseId==='C04');const v=evidence.results.find(a=>a.configuration===mode&&a.caseId==='C01');if(!r||v.status!==200)throw Error('Evidence mismatch');vals.push([name,r.status===200?'Attack succeeds':'Attack stopped',r.findCommands?'1 query sent':'No query sent','Login works']);}
   t(s,'3',64,145,84,62,50,{bold:true,color:C.red});t(s,'controls still allow\nthe attack',153,150,390,62,27,{bold:true,color:C.red});
   t(s,'2',699,145,84,62,50,{bold:true,color:C.green});t(s,'application controls stop it\nbefore any query',788,150,428,62,27,{bold:true,color:C.green});
   line(s,64,229,1152);
   const tb=tab(s,vals,[360,315,225,252],255,286,20);
   for(let n=1;n<6;n++){tb.getCell(n,1).fill=n<4?C.paleRed:C.paleGreen;tb.getCell(n,1).text.style={fontSize:22,typeface:'Arial',bold:true,color:n<4?C.red:C.green};tb.getCell(n,3).fill=C.paleGreen;}
   t(s,'Scripting and read-only controls do not stop this read-only operator attack.',64,567,1152,38,22,{bold:true});
   t(s,'HTTP evidence: attack succeeds = 200; stopped before query = 400; correct login = 200.',64,612,1152,30,19,{color:C.muted});
   break;}
  case 'fix':
   panel(s,64,164,340,450,C.paleRed,C.red,2);label(s,'ATTACK INPUT',89,190,290,C.red);
   t(s,'password:',89,247,270,30,20,{mono:true,color:C.muted});t(s,'{ "$ne": "" }',89,284,275,52,31,{mono:true,color:C.red,bold:true});
   downArr(s,223,348,45,C.red);box(s,'TYPE GATE',112,411,244,74,C.red,C.white,25);
   t(s,'Password must be text',89,506,290,36,24,{bold:true,color:C.red,align:'center'});t(s,'STOPPED\nNo database query',89,553,290,55,23,{bold:true,color:C.red,align:'center'});
   label(s,'LEGITIMATE LOGIN',468,166,748,C.blue);t(s,'The database query contains only the username.',468,212,748,42,29,{bold:true,color:C.blue});
   panel(s,468,270,748,76,'#17252C','#17252C',0);t(s,'users.findOne({ username })',493,291,698,36,26,{mono:true,color:C.white,bold:true,align:'center'});
   const fixHeads=['Validate strings','Find account','Verify hash','Create session'];const fixBodies=['Username and password\nare non-empty text','MongoDB receives\nusername only','App checks password\nagainst stored hash','Only after a\nsuccessful comparison'];
   fixHeads.forEach((v,j)=>{stage=j+1;const x=468+j*192;t(s,'0'+(j+1),x,382,42,34,22,{color:j===3?C.green:C.blue,bold:true});line(s,x,425,166,j===3?C.green:C.blue);t(s,v,x,447,166,55,25,{bold:true,color:j===3?C.green:C.ink});t(s,fixBodies[j],x,513,166,72,20,{color:C.muted});if(j<3)arr(s,x+168,461,21,C.blue);});stage=0;
   t(s,'The submitted password never becomes a database condition.',468,604,748,33,22,{bold:true,color:C.green});break;
  case 'interpreters':
   panel(s,64,164,544,438,C.paleRed,C.red,2);panel(s,672,164,544,438,C.paleBlue,C.blue,2);
   label(s,'MEASURED IN OUR LAB',90,190,480,C.red);t(s,'Operator injection',90,238,480,45,32,{bold:true,color:C.red});
   box(s,'Object contains\n$ne',90,311,202,82,C.red,C.white,23);arr(s,306,341,39,C.red);box(s,'MongoDB reads a\nquery condition',359,311,220,82,C.red,C.white,22);
   t(s,'Result',90,421,100,28,19,{color:C.muted});t(s,'Different records match',90,454,470,37,27,{bold:true,color:C.red});line(s,90,505,470,C.red);t(s,'Defence: accept text only and build the query in application code.',90,526,470,59,21,{bold:true});
   label(s,'LITERATURE COMPARISON',698,190,480,C.blue);t(s,'JavaScript injection',698,238,480,45,32,{bold:true,color:C.blue});
   box(s,'Text enters\nJavaScript source',698,311,202,82,C.blue,C.white,22);arr(s,914,341,39,C.blue);box(s,'JavaScript engine\nexecutes it',967,311,220,82,C.blue,C.white,22);
   t(s,'Result',698,421,100,28,19,{color:C.muted});t(s,'Program logic changes',698,454,470,37,27,{bold:true,color:C.blue});line(s,698,505,470,C.blue);t(s,'Defence: never build code from user text; disable unused scripting.',698,526,470,59,21,{bold:true});
   t(s,'Different interpreter, different defence. We measured the operator route only.',64,620,1152,32,22,{bold:true,align:'center'});break;
  case 'findings':{
   const content=[['1','The attack succeeds','Operator object logs the attacker in as Alice','Session created\nHTTP 200',C.red],['2','The attack is stopped','Object rejected before MongoDB receives a query','No query sent\nHTTP 400',C.green],['3','Legitimate login still works','Correct credentials retain protected access','Access granted\nHTTP 200',C.blue]];
   content.forEach(([n,a,b,c,col],j)=>{const y=173+j*141;t(s,n,64,y,65,65,43,{bold:true,color:col});t(s,a,160,y,782,48,32,{bold:true});t(s,b,160,y+61,790,48,25,{color:C.muted});t(s,c,970,y+6,246,78,25,{bold:true,color:col});if(j<2)line(s,160,y+116,1056);});
   t(s,'Scope: one recorded stack, synthetic accounts and 15 request cases.',64,617,1152,40,24,{color:C.muted});break;}
  case 'conclusion':
   t(s,'APPLICATION RULE',64,156,520,34,20,{bold:true,color:'#9FD3C7'});
   t(s,'Choose the query structure.\nValidate input values.\nVerify the password.',64,207,535,150,34,{bold:true,color:C.white});
   line(s,64,388,500,'#9FD3C7');
   t(s,'NEXT STUDY',64,421,520,34,20,{bold:true,color:'#BAC8CC'});
   t(s,'Can flexible search preserve\ncustomer separation?',64,466,535,88,30,{bold:true,color:C.white});
   t(s,'User-selected filters must never override the tenant rule.',64,592,535,52,21,{color:'#9FD3C7',bold:true});break;
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
   label(s,attack?'ATTACK SUCCEEDS':'ATTACK STOPPED',64,151,1152,col);
   t(s,'{"username":"alice","password":{"$ne":""}}',64,199,1152,54,29,{mono:true,color:col,bold:true});
   line(s,64,272,1152,col);
   await image(s,attack?'fresh-02-evidence.png':'fresh-03-evidence.png',64,309,742,272);
   vline(s,842,309,272,col);
   const evidenceRows=attack?[['HTTP','Session created','200'],['DATABASE','Query sent','1 find'],['ACCESS','Alice’s notes exposed','granted']]:[['HTTP','Credential contract rejected','400'],['DATABASE','No query sent','0 find'],['ACCESS','Protected notes denied','denied']];
   evidenceRows.forEach(([a,b,c],j)=>{const y=309+j*92;t(s,a,878,y,135,27,17,{bold:true,color:C.muted});t(s,b,878,y+29,218,42,22,{bold:true,color:col});t(s,c,1110,y+29,106,42,17,{bold:true,color:col,align:'right'});});
   t(s,attack?'The vulnerable app treats a record match as password proof.':'The hardened app rejects the object before constructing a filter.',64,610,1152,38,24,{bold:true,color:col});
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
