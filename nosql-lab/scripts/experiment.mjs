import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';
import { modeIds } from '../src/server.mjs';
import { probeScripting } from '../src/control-probes.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base='http://127.0.0.1:4400';
const cases=[
  {id:'C01',name:'Valid credentials',body:{username:'alice',password:'Alice-Lab-Only-440!'},unsafe:200,fixed:200},
  {id:'C02',name:'Wrong string password',body:{username:'alice',password:'wrong-password'},unsafe:401,fixed:401},
  {id:'C03',name:'Unknown username',body:{username:'nobody',password:'wrong-password'},unsafe:401,fixed:401},
  {id:'C04',name:'Password operator object',body:{username:'alice',password:{$ne:''}},unsafe:200,fixed:400},
  {id:'C05',name:'Username operator with wrong password',body:{username:{$ne:''},password:'wrong-password'},unsafe:401,fixed:400},
  {id:'C06',name:'Operator-looking literal string',body:{username:'alice',password:'{"$ne":""}'},unsafe:401,fixed:401},
  {id:'C07',name:'Null password',body:{username:'alice',password:null},unsafe:401,fixed:400},
  {id:'C08',name:'Array password',body:{username:'alice',password:[]},unsafe:401,fixed:400},
  {id:'C09',name:'Missing password',body:{username:'alice'},unsafe:401,fixed:400},
  {id:'C10',name:'Numeric password',body:{username:'alice',password:440},unsafe:401,fixed:400},
  {id:'C11',name:'Extra field with valid credentials',body:{username:'alice',password:'Alice-Lab-Only-440!',role:'administrator'},unsafe:200,fixed:400},
  {id:'C12',name:'Top-level array',body:[],unsafe:401,fixed:400},
  {id:'C13',name:'Both fields contain operators',body:{username:{$ne:''},password:{$ne:''}},unsafe:200,fixed:400},
  {id:'C14',name:'Empty password',body:{username:'alice',password:''},unsafe:401,fixed:400},
  {id:'C15',name:'Empty username',body:{username:'',password:'wrong-password'},unsafe:401,fixed:400}
];
const environment=await(await fetch(base+'/api/health')).json();
assert.equal(environment.ready,true);
const packageInfo=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8'));
const config=JSON.parse(await fs.readFile(path.join(root,'.state','config.json'),'utf8'));
const results=[];
const main = new MongoClient(config.main,{monitorCommands:true});
await main.connect();
assert.equal(await main.db('cs440_lab').collection('accounts_hashed').countDocuments({password:{$exists:true}}),0,'Hardened records must contain no plaintext password');
assert.equal(await main.db('cs440_lab').collection('accounts_hashed').countDocuments(),3);
// The API process observes actual find commands using per-request comments.
for(let repetition=1;repetition<=2;repetition++) {
  for(const mode of modeIds) {
    for(const test of cases) {
      const response=await fetch(base+'/api/login/'+mode,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(test.body)});
      const body=await response.json();
      const expected=(mode==='validated'||mode==='hardened')?test.fixed:test.unsafe;
      assert.equal(response.status,expected,`${mode}/${test.id} status`);
      assert.equal(body.trace.authenticated,expected===200,`${mode}/${test.id} session decision`);
      assert.equal(body.trace.databaseQueried,expected!==400,`${mode}/${test.id} query occurrence`);
      assert.equal(body.trace.findCommands,expected===400?0:1,`${mode}/${test.id} observed find commands`);
      const cookie=response.headers.getSetCookie().find(x=>/^cs440_session=[a-f0-9]{64};/.test(x))?.split(';')[0];
      assert.equal(Boolean(cookie), expected === 200, `${mode}/${test.id} usable session cookie`);
      const protectedResponse=await fetch(base+'/api/protected',{headers:cookie?{Cookie:cookie}:{}});
      assert.equal(protectedResponse.status,expected===200?200:401,`${mode}/${test.id} protected page`);
      const protectedBody=await protectedResponse.json();
      if(expected===200 && test.id!=='C13')assert.equal(protectedBody.username,'alice');
      results.push({repetition,configuration:mode,caseId:test.id,case:test.name,status:response.status,authenticated:body.trace.authenticated,databaseQueried:body.trace.databaseQueried,findCommands:body.trace.findCommands,account:body.trace.account,protectedStatus:protectedResponse.status,filter:body.trace.filter,request:body.trace.request});
    }
  }
}
await main.close();
const controls={};
for(const [id,uri] of [['main',config.main],['noscripting',config.noscripting],['readonly',config.readonly]]) {
  const client=new MongoClient(uri);await client.connect();
  const db=client.db('cs440_lab');
  const connection=await db.command({connectionStatus:1});
  controls[id]={authenticatedUsers:connection.authInfo.authenticatedUsers,authenticatedRoles:connection.authInfo.authenticatedUserRoles};
  assert.deepEqual(controls[id].authenticatedRoles, [{ role: id === 'readonly' ? 'read' : 'readWrite', db: 'cs440_lab' }], `${id} actual database role`);
  if(id==='readonly') {
    assert.equal((await db.collection('users').findOne({username:'alice'})).username,'alice');
    try{await db.collection('users').insertOne({username:'unexpected-write'});assert.fail('Read-only account unexpectedly wrote');}
    catch(error){assert.equal(error.code,13);controls[id].writeDenied=true;controls[id].writeError=error.codeName;}
  }
  if(id==='main'||id==='noscripting') Object.assign(controls[id], await probeScripting(db.collection('users'), { disabled: id === 'noscripting' }));
  await client.close();
}
assert.equal(controls.main.whereAllowed,true);assert.equal(controls.noscripting.whereAllowed,false);
for(const mode of modeIds){
  const malformed=await fetch(base+'/api/login/'+mode,{method:'POST',headers:{'Content-Type':'application/json'},body:'{"username":'});assert.equal(malformed.status,400);
  const deniedOrigin=await fetch(base+'/api/login/'+mode,{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://example.invalid'},body:JSON.stringify(cases[0].body)});assert.equal(deniedOrigin.status,403);
}
const evidence={schemaVersion:1,recordedAt:new Date().toISOString(),environment:{...environment,express:packageInfo.dependencies.express,mongodbDriver:packageInfo.dependencies.mongodb,passwordHash:'scrypt N=131072 r=8 p=1, 16-byte random salt, 64-byte output'},method:{cases:cases.length,configurations:modeIds.length,repetitions:2,totalHttpCases:results.length,additionalHttpChecks:10,scope:'One local Node/Express/native-driver stack; synthetic plaintext reproduction and separate hash-verifying path'},controls,results};
await fs.mkdir(path.join(root,'evidence'),{recursive:true});
await fs.writeFile(path.join(root,'evidence','results.json'),JSON.stringify(evidence,null,2));
const columns=['repetition','configuration','caseId','case','status','authenticated','databaseQueried','findCommands','account','protectedStatus'];
const csv=columns.join(',')+'\n'+results.map(row=>columns.map(k=>'"'+String(row[k]??'').replaceAll('"','""')+'"').join(',')).join('\n')+'\n';
await fs.writeFile(path.join(root,'evidence','results.csv'),csv);
console.log(`PASS: ${results.length} configuration/case/repetition checks, protected-access checks, real scripting and read-only controls, plus 10 malformed/origin checks.`);
console.log(`MongoDB ${environment.database}; Node ${environment.node}. Evidence: evidence/results.json and results.csv.`);
