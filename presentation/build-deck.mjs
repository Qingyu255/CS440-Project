import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const build = path.join(root,'.build');
const skill = process.env.PRESENTATIONS_SKILL_DIR;
const runtimePython = process.env.RUNTIME_PYTHON;
if (!skill || !runtimePython || !process.env.RUNTIME_NODE_MODULES || !process.env.RUNTIME_NODE) {
  throw new Error('See presentation/README.md for the required Codex artifact runtime paths.');
}
const { resolvePresentationFont, finalizePresentation } = await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const font = resolvePresentationFont({fontFamily:'Arial'});
const mono = resolvePresentationFont({fontFamily:'Courier New'});
const colors = {bg:'#F6F6F2',ink:'#17252C',muted:'#51616A',red:'#AF3047',green:'#087B6D',blue:'#275A80',dark:'#17252C',white:'#FFFFFF'};
const presentation = Presentation.create({slideSize:{width:1280,height:720}});
const authored=[];

function text(slide,value,x,y,w,h,size=30,options={}) {
  const sh=slide.shapes.add({geometry:'textbox',name:options.name,position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
  sh.text=value;
  sh.text.style={typeface:options.mono?mono:font,fontSize:size,color:options.color??colors.ink,bold:options.bold??false,autoFit:'none',wrap:'square',insets:{top:0,right:0,bottom:0,left:0},...options.style};
  return sh;
}
function slide(title,notes,{dark=false,source=''}={}) {
  const s=presentation.slides.add();s.background.fill=dark?colors.dark:colors.bg;
  text(s,title,64,48,1152,100,43,{bold:true,color:dark?colors.white:colors.ink,name:'slide-title'});
  authored.push({slide:s,title,notes});
  const number=authored.length;
  text(s,String(number).padStart(2,'0'),1164,674,52,24,19,{color:dark?'#C2CCD0':colors.muted});
  if(source)text(s,source,64,666,1040,30,17,{color:dark?'#C2CCD0':colors.muted});
  s.speakerNotes.textFrame.setText(notes);
  return s;
}
function table(s,values,{x=64,y=180,w=1152,h=360,widths,size=26}={}) {
  const t=s.tables.add({rows:values.length,columns:values[0].length,left:x,top:y,width:w,height:h,values,columnWidths:widths});
  t.cells.block({row:0,column:0,rowCount:values.length,columnCount:values[0].length}).assign({fill:colors.bg,textStyle:{typeface:font,fontSize:size,color:colors.ink},margins:{left:14,right:14,top:8,bottom:8},anchor:'center'});
  for(let c=0;c<values[0].length;c++) {
    t.getCell(0,c).fill=colors.ink;t.getCell(0,c).text.style={typeface:font,fontSize:size,bold:true,color:colors.white};
  }
  t.borders.assign({fill:'#D2D8D6',width:1,style:'solid'});
  return t;
}

const evidence=JSON.parse(await fs.readFile(path.join(root,'nosql-lab/evidence/results.json'),'utf8'));
if(evidence.method.totalHttpCases!==150 || evidence.results.length!==150)throw new Error('Unexpected evidence coverage');
const observed=(mode,id)=>{const rows=evidence.results.filter(r=>r.configuration===mode&&r.caseId===id);if(rows.length!==2||rows[0].status!==rows[1].status||rows[0].findCommands!==rows[1].findCommands)throw new Error(`Inconsistent evidence: ${mode}/${id}`);return rows[0];};
const sources={
 paper:'https://www.infoq.com/articles/nosql-injections-analysis/',
 publication:'https://research.ibm.com/publications/analysis-and-mitigation-of-nosql-injections',
 ne:'https://www.mongodb.com/docs/manual/reference/operator/query/ne/',
 nosql:'https://cheatsheetseries.owasp.org/cheatsheets/NoSQL_Security_Cheat_Sheet.html',
 js:'https://www.mongodb.com/docs/v8.0/core/server-side-javascript/',
 where:'https://www.mongodb.com/docs/v7.0/reference/operator/query/where/',
 password:'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html',
 roles:'https://www.mongodb.com/docs/manual/reference/built-in-roles/'
};
function notes(time,script,refs=[]){return `Target time: ${time}\n\n${script}\n\nSources: ${refs.map(r=>sources[r]).join('\n') || 'Local experiment: nosql-lab/evidence/results.json, results.csv and source code.'}`;}
function label(s,value,x,y,w=550,color=colors.muted){return text(s,value,x,y,w,40,23,{bold:true,color});}
function diagramBox(s,value,x,y,w,h,color=colors.ink){const b=s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:color,width:2}});b.text=value;b.text.style={typeface:font,fontSize:26,bold:true,color,alignment:'center',verticalAlignment:'middle',insets:{left:8,right:8,top:8,bottom:8},autoFit:'none'};return b;}
const nativeTableSlides=[];
function evidenceTable(s,values,options){nativeTableSlides.push(authored.length);return table(s,values,options);}
let s;

s=slide('NoSQL Injections',notes('0:25',`A login request can be valid JSON and still change the meaning of a database query. We investigated exactly where that change happens, then tested which controls stop it. Our project reproduces a mechanism from Ron and colleagues' 2016 paper and extends it with a controlled local comparison. The question is whether the application preserves its intended credential check.`,['publication']),{dark:true});
text(s,'When client input changes\na database query',64,190,1110,180,60,{bold:true,color:colors.white});
text(s,'A controlled MongoDB investigation',64,433,1100,60,33,{color:'#C2CCD0'});
text(s,'CS440 Group Project',64,555,900,40,24,{color:'#C2CCD0'});

s=slide('Documents and query predicates',notes('0:50',`NoSQL covers several database families. We focus on MongoDB, a document database. Its documents contain named fields, and a filter describes which documents to return. Here, the left-hand query looks for one literal username. The right-hand query uses an operator to match usernames that differ from an empty string. Both filters have structured representations, but they express different predicates. The MongoDB driver serialises the filter to BSON for the server. Our web interface receives JSON, which the application parses into JavaScript values. That representation change matters because the application expects credential strings.`,['ne','paper']),{source:'MongoDB $ne documentation; Ron et al., 2016'});
label(s,'SYNTHETIC ACCOUNT',64,173);text(s,'{ username: "alice",\n  role: "student" }',64,215,1090,90,32,{mono:true});
label(s,'LITERAL EQUALITY',64,353,540,colors.blue);text(s,'{ username: "alice" }',64,407,550,65,30,{mono:true});
label(s,'OPERATOR PREDICATE',670,353,545,colors.red);text(s,'{ username: { $ne: "" } }',670,407,545,90,30,{mono:true,color:colors.red});
text(s,'NoSQL families: document, key-value, graph and wide-column\nFlexible records and distributed scaling support different workloads',64,538,1110,95,27,{color:colors.muted});

s=slide('Application architecture and threat model',notes('0:50',`The attacker can submit JSON to the login endpoint and knows Alice's username. They cannot alter application code, change the records or connect directly to the database. The application parses the request, constructs a filter and uses its legitimate database service account. The dangerous boundary is where a client-controlled value becomes a query condition. After the database returns an account, the application creates a session. In CS440 terms, the service account's authority to read a record is different from evidence of the end user's identity. False authentication can then expose that user's protected data.`,['paper','roles']));
const client=diagramBox(s,'Client\nJSON request',64,230,250,112,colors.red);
const appBox=diagramBox(s,'Application\nparser + filter',415,230,350,112,colors.blue);
const db=diagramBox(s,'MongoDB\nservice account',865,230,350,112);
s.shapes.connect(client,appBox,{kind:'straight',fromSide:'right',toSide:'left',line:{fill:colors.muted,width:2},tail:{type:'triangle',width:'sm',length:'sm'}});
s.shapes.connect(appBox,db,{kind:'straight',fromSide:'right',toSide:'left',line:{fill:colors.muted,width:2},tail:{type:'triangle',width:'sm',length:'sm'}});
text(s,'Trust boundary: the app accepts a value as a database predicate',64,411,1150,74,33,{bold:true,color:colors.red});
text(s,'Attacker: JSON body and known username, no direct DB access\nApp: matching account creates a session\nConsequence: false identity exposes protected data',64,514,1150,130,28);

s=slide('Attack landscape and study scope',notes('0:50',`The paper surveys several boundaries. Objects can become query predicates. Constructed query text can acquire extra logic, which the authors discuss using SQL-inspired union terminology. These labels can overlap. Client strings can also enter JavaScript source or a protocol command. The browser-origin example concerns CSRF, a separate trust issue. We investigate operator injection experimentally and compare it conceptually with JavaScript injection. That choice gives us depth while locating the result within the wider topic. Our research question is which controls stop the operator-based login bypass. The five rows describe the literature landscape, not five attacks we have demonstrated.`,['paper','publication']),{source:'Ron, Shulman-Peleg & Puzanov. IEEE Security & Privacy 14(2), 30-39 (2016)'});
evidenceTable(s,[['Mechanism','Boundary crossed','Our treatment'],['Operator injection','Object becomes predicate','Measured deep dive'],['Query text (union-like)','Text changes query structure','Paper overview'],['JavaScript injection','String becomes JS source','Conceptual contrast'],['Command piggybacking','Input adds a protocol command','Historical context'],['Browser-origin attacks','Browser uses victim credentials','Adjacent issue (CSRF)']],{y:170,h:365,widths:[400,430,322],size:25});
text(s,'Which controls stop the operator-based login bypass?',64,571,1130,74,32,{bold:true});

s=slide('An object changes the password condition',notes('1:00',`This is the exact injected request. Alice's username remains a literal string. The password field becomes an object containing the not-equal operator. The vulnerable code passes both values directly into findOne. That produces a filter requiring username equal to Alice and password different from the empty string. Alice's synthetic stored password is non-empty, so her record matches. The application then creates a session without proof that the client knows her password. The object needs no JavaScript execution, and no quote-breaking payload. The database executes a supported predicate. The failure comes from the application's accepted input and its interpretation of the match.`,['ne','nosql']),{source:'C04 reproduction; MongoDB $ne documentation'});
label(s,'CLIENT REQUEST',64,167,1130,colors.red);
text(s,'{"username":"alice","password":{"$ne":""}}',64,213,1150,65,32,{mono:true,color:colors.red});
label(s,'VULNERABLE APPLICATION CODE',64,320);
text(s,'users.findOne({\n  username: body.username,\n  password: body.password\n})',64,365,650,190,30,{mono:true});
text(s,'Alice matches when her\nstored password is non-empty',760,374,450,130,32,{bold:true});
text(s,'A matched record incorrectly becomes an authenticated session',64,582,1150,63,29,{color:colors.red,bold:true});

s=slide('Input shape and attack assumptions',notes('1:00',`The key distinction is an operator object versus operator-looking text. The object changes the query predicate. A string containing those same characters stays a literal value in this filter and fails to match. Our negative control confirms that difference. This example also depends on the application accepting objects and granting a session when a record matches. We use a known unique username, so we can say exactly which account the request selects. The toy reproduction stores synthetic plaintext passwords to expose this mechanism. The final path uses a separate hash-only account collection and verifies the password independently. A broad findOne query does not guarantee an administrator account.`,['ne','password']),{source:'C04 object attack and C06 literal-string control; synthetic plaintext reproduction'});
label(s,'OPERATOR OBJECT',64,178,545,colors.red);
text(s,'"password": { "$ne": "" }',64,231,1120,65,34,{mono:true,color:colors.red});
label(s,'LITERAL STRING',64,340,545,colors.blue);
text(s,'"password": "{\\"$ne\\":\\"\\"}"',64,393,1120,65,34,{mono:true,color:colors.blue});
text(s,'Known unique username. Non-empty stored value. Session on match.',64,506,1130,74,29,{bold:true});
text(s,'Lab simplification: plaintext toy query; hardened path uses hash-only records',64,602,1150,50,24,{color:colors.muted});

s=slide('Controlled experiment',notes('0:35',`We ran fifteen request cases across five configurations, twice: one hundred and fifty observations. Each records the login decision, protected access and actual database find commands. The fixtures include legitimate credentials, wrong strings and unexpected input shapes. Separate probes check the database roles and require MongoDB's specific scripting-disabled error. Repetition supports local reproducibility. It does not estimate deployed prevalence.`));
text(s,'15 request cases × 5 configurations × 2 runs',64,188,1152,90,42,{bold:true});
text(s,'150 configuration/case observations',64,312,1152,70,36,{color:colors.blue});
text(s,'Login status and session decision\nProtected-page access\nActual database find commands',64,425,1130,170,32);

s=slide('Live demonstration',notes('1:30',`[0-15 seconds] This is our local synthetic lab. First, a wrong password fails and protected notes stay inaccessible. [15-40 seconds] We replace the password string with the operator object. The vulnerable path receives that predicate, matches Alice and creates a session. We can now read her synthetic private notes without supplying her password. [40-65 seconds] We keep the identical request and switch to the hardened path. It rejects the credential contract before constructing a filter or issuing a find command. [65-85 seconds] Finally, valid credentials still authenticate correctly after the fix. [85-90 seconds] The comparison identifies the boundary we restored: credential values remain values. If live playback fails, show the captured states in appendix slides 20 and 21 and narrate the same sequence.`));
evidenceTable(s,[['Step','Request and configuration','Observed outcome'],['1','Wrong password / baseline','401; access denied'],['2','Operator object / baseline','200; Alice session'],['3','Same object / hardened','400; zero find commands'],['4','Valid credentials / hardened','200; Alice session']],{y:183,h:360,widths:[100,620,432],size:27});
const demo=text(s,'Open local lab: http://127.0.0.1:4400',64,585,1110,60,29,{color:colors.blue});
demo.text.get('http://127.0.0.1:4400').link={uri:'http://127.0.0.1:4400',isExternal:true};

s=slide('Results identify the effective boundary',notes('1:05',`Here are the observed results for the identical password-operator request. It creates an Alice session in the baseline, with scripting disabled, and with a database account restricted to reads. In each of those cases, one find command runs. Both validation paths reject the request with zero find commands. Every configuration still accepts valid string credentials and rejects the wrong string password. Disabling scripting addresses execution of JavaScript, while this attack uses a normal query operator. Read-only privileges block writes, but the login failure needs only a read. The isolated validation condition lets us attribute the change to type enforcement before discussing the complete authentication design.`),{source:'Measured C01, C02 and C04; 15 cases × 5 configurations × 2 repetitions'});
const comparisons=[['Configuration','C04 login','Find commands','Valid login']];
for (const [mode,label] of [['baseline','Baseline'],['noscripting','JavaScript disabled'],['readonly','Read-only account'],['validated','String validation only'],['hardened','Full hardened path']]) {
 const c04=observed(mode,'C04'), valid=observed(mode,'C01');
 comparisons.push([label,`${c04.status} / ${c04.authenticated?'Alice':'rejected'}`,String(c04.findCommands),String(valid.status)]);
 if(observed(mode,'C02').status!==401)throw new Error('Wrong-password control changed');
}
evidenceTable(s,comparisons,{y:164,h:390,widths:[410,275,240,227],size:26});
text(s,'Wrong string passwords return 401 in every configuration',64,568,1140,44,25,{color:colors.muted});
text(s,'Validation stops the tested bypass before a database read',64,611,1140,44,29,{bold:true,color:colors.red});

s=slide('Validation and independent credential verification',notes('0:55',`The smallest causal fix rejects objects where the login contract requires strings. It preserves application control over field names and query structure. Our complete path goes further. It validates allowed fields, lengths and types, then looks up an account by its validated username. It retrieves that account from a separate collection containing no plaintext passwords. It verifies the supplied password against a salted scrypt hash before creating the session. The same password object therefore never reaches MongoDB. Password hashing protects credential storage, while contract validation protects query intent. We tested both invalid inputs and legitimate authentication. This local teaching path still does not represent a complete deployed identity system.`,['nosql','password']),{source:'src/server.mjs, src/passwords.mjs; scrypt N=131072, r=8, p=1'});
label(s,'ISOLATED FIX',64,174,1100,colors.green);
text(s,'typeof username === "string"\ntypeof password === "string"',64,224,1110,110,34,{mono:true,color:colors.green});
label(s,'COMPLETE AUTHENTICATION PATH',64,384,1110,colors.green);
text(s,'Validate request contract\nLook up account by username\nVerify password hash before creating a session',64,436,1110,165,34);

s=slide('Operator injection and JavaScript injection',notes('0:55',`The distinction is what interprets the input. Our measured attack supplies an object that MongoDB interprets as a query predicate. In a different application design, a string may be concatenated into a JavaScript expression and passed to a server-side facility such as $where. Requiring a string would still accept that input type. The relevant control is to avoid constructing executable source from client input and disable unused scripting. We use this as a literature-based contrast. Our harmless fixed $where probe only checks the configuration. It is not a second injection experiment. This explains why defences must match the interpretation boundary.`,['paper','where','nosql']),{source:'Ron et al., 2016 / MongoDB 7.0 $where documentation / OWASP NoSQL guidance'});
evidenceTable(s,[['Boundary','Operator injection','JavaScript injection'],['Input form','Object containing $ne','String inserted into JS source'],['Interpreter','MongoDB query predicate','Server-side JavaScript'],['Relevant control','String-only login contract','Avoid building JS source\nDisable unused scripting']],{y:170,h:320,widths:[250,451,451],size:25});
text(s,'A string can still become executable code in another context',64,535,1150,70,31,{bold:true,color:colors.red});
text(s,'Conceptual contrast. Our $where probe checks configuration only.',64,608,1150,40,24,{color:colors.muted});

s=slide('Findings and engineering lessons',notes('0:45',`Our measured result concerns operator objects: validation rejects them before a find command while legitimate login still works. The wider comparison explains the limit of that result. A string can satisfy a type check and still become executable source in another design. Each control needs a specified boundary and evidence that it enforces that boundary. Our experiment supports the credential-contract claim. The literature supports the JavaScript contrast. The engineering lesson is to retain application control over query or code structure, then test the resulting security decision and legitimate functionality.`,['nosql','paper','where']));
text(s,'01',64,183,80,55,35,{color:colors.red,bold:true});text(s,'Client-owned operators can change credential checks',172,184,1044,90,34,{bold:true});
text(s,'02',64,330,80,55,35,{color:colors.green,bold:true});text(s,'Validated types stop the tested operator-object bypass',172,331,1044,90,34,{bold:true});
text(s,'03',64,477,80,55,35,{color:colors.blue,bold:true});text(s,'A fix must preserve legitimate authentication',172,478,1044,90,34,{bold:true});

s=slide('Flexible filters need enforceable access policies',notes('0:50',`Our login contract can require strings, but search APIs sometimes need richer filters. The open problem is how to allow that flexibility while ensuring tenant or ownership restrictions remain in force. A bounded next investigation would compare an explicit operator-and-field allowlist with a query builder that keeps mandatory access predicates outside client control. Our current evidence covers one local stack, synthetic data and fifteen request cases. It does not estimate deployed prevalence or certify all endpoints. Our final recommendation follows from the mechanism we observed: keep the application's query structure under application control and test that unauthorised inputs never become proof of identity.`,['nosql']),{dark:true});
text(s,'How can useful client-selected filters\npreserve tenant and ownership restrictions?',64,193,1140,150,43,{bold:true,color:colors.white});
text(s,'Scope: one local stack, synthetic records, 15 request cases',64,402,1120,74,29,{color:'#C2CCD0'});
text(s,'Application-owned query structure protects the intended security decision',64,526,1140,100,35,{bold:true,color:colors.white});

// Focused appendices support inspection and Q&A outside the timed main talk.
s=slide('Appendix: exact environment',notes('Q&A',`This is the environment recorded by the experiment runner. MongoDB 7.0.0 is the installed lab binary, not a recommendation to deploy this old patch. Two authenticated instances use separate project-local directories and loopback ports. All records are synthetic. MongoDB 8.0 documentation separately deprecates server-side JavaScript functions. That documentation is not a MongoDB 8 experiment, and deprecation does not establish removal. Docker is not required for the verified native execution path. The environment values come from nosql-lab/evidence/results.json.`,['js']));
evidenceTable(s,[['Component','Recorded value'],['MongoDB server',evidence.environment.database],['Node.js',evidence.environment.node],['Express / MongoDB driver','5.1.0 / 6.20.0'],['Transport and parser','Local HTTP / application/json / express.json'],['Hash-only account store','scrypt N=131072, r=8, p=1'],['Evidence coverage','15 cases / 5 configurations / 2 runs']],{y:165,h:430,widths:[480,672],size:25});

s=slide('Appendix: query mechanism and session decision',notes('Q&A',`This is an excerpt of the deliberately vulnerable branch in src/server.mjs. The code selects a client according to the control configuration, then uses the body values as predicates. A truthy matched account directly establishes authentication in the toy modes. The hardened branch differs and appears in the next appendix. Filters in the evidence redact ordinary passwords but preserve the operator object. The database command monitor counts actual find events using each request's comment ID.`));
text(s,'const filter = {\n  username: req.body.username,\n  password: req.body.password\n};\nconst account = await users.findOne(filter);\nconst authenticated = Boolean(account);\nif (authenticated) createSession(account);',64,190,1152,330,30,{mono:true});
text(s,'Deliberately vulnerable excerpt. Synthetic plaintext account collection.',64,581,1150,68,25,{color:colors.red,bold:true});

s=slide('Appendix: hardened credential path',notes('Q&A',`This is a condensed excerpt. The full source validates exactly two allowed fields, non-empty strings and length limits. It queries a hash-only account collection. The hashing module uses a random salt and timing-safe comparison. An unknown account follows a dummy-hash verification path and receives the same invalid-credentials response. Sessions are short-lived local demonstration sessions, not a production identity platform. No supplied credential object reaches the database in this path.`,['password']));
text(s,'if (!validContract(req.body)) return reject(400);\n\nconst account = await accounts_hashed.findOne({\n  username: req.body.username\n});\n\nconst ok = await verifyPassword(\n  req.body.password, account?.passwordHash ?? dummyHash\n);\nif (account && ok) createSession(account);',64,175,1152,400,28,{mono:true});
text(s,'Separate hash-only records. No plaintext password in accounts_hashed.',64,605,1150,45,24,{color:colors.green,bold:true});

const unique=evidence.results.filter(r=>r.configuration==='baseline'&&r.repetition===1);
for(const [start,end,title] of [[0,8,'Appendix: case results C01-C08'],[8,15,'Appendix: case results C09-C15']]){
 s=slide(title,notes('Q&A',`Each cell summarises one configuration-case outcome. The two repetitions agree. Baseline, scripting-disabled and read-only configurations produce the same login statuses for these fixtures. Validated and fully hardened paths also agree on status, although their credential-verification designs differ. A 200 means the app created a session and the protected endpoint returned 200. A 401 means authentication failed and protected access failed. A 400 means contract rejection before a find command. See results.json and results.csv for every observation.`));
 const vals=[['Case','Request shape','Toy modes','Validated / hardened']];
 for(const row of unique.slice(start,end)){
  const fixed=evidence.results.find(r=>r.caseId===row.caseId&&r.configuration==='hardened'&&r.repetition===1);
  vals.push([row.caseId,row.case,String(row.status),String(fixed.status)]);
 }
 evidenceTable(s,vals,{y:165,h:445,widths:[110,570,185,287],size:23});
}

s=slide('Appendix: independent configuration checks',notes('Q&A',`The read-only service account is authenticated as labreader with the read role on the dedicated lab database. A permitted read succeeds. An attempted synthetic insertion fails with MongoDB code 13, Unauthorized. Separately, a harmless where predicate returns Alice on the scripting-enabled server and fails with code 6108304 on the no-scripting instance. These observations establish that our controls were active. The fixed where expression contains no attacker-controlled source construction. It establishes configuration behaviour, not a second injection exploit.`));
evidenceTable(s,[['Control','Independent observation'],['Authenticated read-only account','labreader / read role on cs440_lab'],['Read permission','Alice record lookup succeeds'],['Write restriction','Insert fails: code 13 / Unauthorized'],['JavaScript enabled','Harmless $where predicate returns Alice'],['JavaScript disabled','Same $where fails: code 6108304']],{y:175,h:365,widths:[470,682],size:26});
text(s,'C04 still creates a session in both control configurations',64,586,1140,63,29,{bold:true,color:colors.red});

for(const [prefix,title,caption] of [
 ['bypass','Appendix: captured authentication bypass','C04 / baseline: Alice session; protected notes accessible'],
 ['hardened','Appendix: captured hardened rejection','C04 / hardened: no query; no session; protected notes denied']
]){
 s=slide(title,notes('Demo backup / Q&A',`${caption}. These two regions are cropped captures of the actual local browser interaction. Complete screenshots of all four stages are included in nosql-lab/evidence/browser. The same operator-object request was submitted in both configurations. The appendix preserves the measured outcome if live playback fails.`));
 text(s,caption,64,165,1140,90,29,{bold:true,color:prefix==='bypass'?colors.red:colors.green});
 label(s,'DATABASE PREDICATE',64,286,550);
 label(s,'APPLICATION DECISION',670,286,545);
 for(const [suffix,x] of [['filter',64],['decision',670]]){
  const imageBytes=await fs.readFile(path.join(root,'nosql-lab/evidence/browser',`${prefix}-${suffix}.jpg`));
  s.images.add({blob:new Uint8Array(imageBytes),contentType:'image/jpeg',alt:`${caption}: ${suffix}`,fit:'contain',position:{left:x,top:347,width:546,height:249}});
 }
}

s=slide('Appendix: limits and further investigation',notes('Q&A',`Two repeated passes establish reproducibility within this recorded environment. We have not independently executed the lab on another physical machine, and we have not tested a different ODM, parser or MongoDB major version. The lab does not demonstrate a JavaScript injection exploit or measure attack prevalence, arbitrary admin access, data modification or denial of service. Slide 11 compares mechanisms conceptually. MongoDB 8.0 deprecation is a documentation claim, not a measured runtime result. Its complete hardened branch still needs deployment controls before use outside teaching. The next research question concerns enforceable filters when applications need client-selected query flexibility.`,['js','where']));
text(s,'Established',64,180,550,60,34,{bold:true,color:colors.green});
text(s,'Operator bypass in this toy login\nControl behaviour in the recorded stack\nRejection before a find command\nPreservation of valid login',64,250,550,275,30);
text(s,'Outside the evidence',704,180,510,60,34,{bold:true,color:colors.muted});
text(s,'JavaScript injection exploit\nDeployed prevalence\nOther DB versions or ODMs\nArbitrary administrator access\nComplete production security',704,250,510,275,30);
text(s,'Next study: enforce mandatory ownership predicates in flexible search APIs',64,585,1145,64,27,{bold:true});

s=slide('References: assigned article and database semantics',notes('Reference',`The SMU library proxy was inaccessible during preparation. The authors' accessible republication supplied the technical discussion. IBM Research confirms the publication identity. The republication has conflicting magazine boilerplate, so the bibliography follows the IBM record. Original page and figure references should be checked against the library copy if used.`,['publication','paper','ne','where','js']));
text(s,'Ron, A., Shulman-Peleg, A. & Puzanov, A. (2016)\nAnalysis and Mitigation of NoSQL Injections\nIEEE Security & Privacy, 14(2), 30-39\nDOI: 10.1109/MSP.2016.36',64,176,1150,164,29);
text(s,'IBM Research publication record\nresearch.ibm.com/publications/analysis-and-mitigation-of-nosql-injections',64,375,1150,86,23);
text(s,'MongoDB: $ne and $where query predicates\nMongoDB 8.0: server-side JavaScript deprecation\nAuthors’ republication: InfoQ, January 2017',64,509,1150,125,27);

s=slide('References: defences and project evidence',notes('Reference',`Source URLs are included in these notes and on relevant slides. Accessed during project preparation. The local result files include environment metadata, control observations and every case. Code, request fixtures, screenshots and run instructions accompany the deck.`,['nosql','password','roles']));
text(s,'OWASP NoSQL Security Cheat Sheet\nOWASP Password Storage Cheat Sheet\nMongoDB Built-In Roles documentation',64,178,1150,145,30);
text(s,'Project evidence\nnosql-lab/evidence/results.json\nnosql-lab/evidence/results.csv\nnosql-lab/src/server.mjs\nnosql-lab/scripts/experiment.mjs',64,372,1150,216,29,{mono:true});

await fs.mkdir(path.join(build,'renders'),{recursive:true});
await fs.mkdir(path.join(root,'deliverables'),{recursive:true});
const candidatePath=path.join(build,'candidate.pptx');
await (await PresentationFile.exportPptx(presentation)).save(candidatePath);
const finalPath=path.join(root,'deliverables',process.env.DECK_FILENAME??'CS440-NoSQL-Injections-Scope-Expanded.pptx');
const result=await finalizePresentation({
 workspaceDir:root,candidatePath,finalPath,pythonExecutable:runtimePython,
 integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),
 explicitTotalSlideCount:authored.length,requiredNativeTableOwnerSlides:nativeTableSlides,
 layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit',...nativeTableSlides.flatMap(n=>['--require-native-table-slide',String(n)])],
 fontPolicy:{basis:'design',families:[font,mono]},verifyArtifactToolImport:true,
 receiptPath:path.join(build,path.basename(finalPath)+'.validation.json')
});
console.log(JSON.stringify({slides:authored.length,finalPath,result}));
for(let i=0;i<authored.length;i++){
 const png=await presentation.export({slide:authored[i].slide,format:'png',scale:1.2});
 await fs.writeFile(path.join(build,'renders',`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await png.arrayBuffer()));
 const layout=await authored[i].slide.export({format:'layout'});
 await fs.writeFile(path.join(build,'renders',`slide-${String(i+1).padStart(2,'0')}.layout.json`),await layout.text());
}
await fs.writeFile(path.join(root,'presentation','slide-source.json'),JSON.stringify(authored.map(({title,notes},i)=>({slide:i+1,title,notes})),null,2));
const script=authored.slice(0,13).map((a,i)=>`## Slide ${i+1}: ${a.title}\n\n${a.notes}`).join('\n\n');
await fs.writeFile(path.join(root,'deliverables','Speaker-Script.md'),'# CS440 NoSQL Injections: speaker script\n\n13 main slides. Target 11:30, including the 90-second demo. Times are rehearsal targets, not measured delivery durations.\n\n'+script+'\n');
