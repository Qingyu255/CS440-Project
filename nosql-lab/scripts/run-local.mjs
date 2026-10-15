import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { createServer } from 'node:net';
import { mkdir, readFile, writeFile, chmod } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';
import { seedDatabase } from '../src/database.mjs';
import { startApp } from '../src/server.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
// Refuse occupied ports before creating or connecting to any database.
for (const port of [4400, 54171, 54172]) {
  await new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', err => reject(new Error(`Port ${port} unavailable (${err.code}); stop the conflicting lab first. No database was contacted.`)));
    probe.listen(port, '127.0.0.1', () => probe.close(resolve));
  });
}
const state = path.join(root,'.state');
await mkdir(state,{recursive:true});
await mkdir(path.join(root,'evidence'),{recursive:true});
let secrets;
try { secrets = JSON.parse(await readFile(path.join(state,'credentials.json'),'utf8')); }
catch(err) { if(err.code !== 'ENOENT')throw err; secrets = {admin:randomBytes(24).toString('hex'),app:randomBytes(24).toString('hex'),reader:randomBytes(24).toString('hex')};await writeFile(path.join(state,'credentials.json'),JSON.stringify(secrets),{mode:0o600}); }
await chmod(path.join(state,'credentials.json'),0o600);
const adminUri = port => `mongodb://labadmin:${secrets.admin}@127.0.0.1:${port}/admin`;
const appUri = (port,user='labapp') => `mongodb://${user}:${user === 'labreader' ? secrets.reader : secrets.app}@127.0.0.1:${port}/cs440_lab?authSource=cs440_lab`;
const children = [];
let application;
let stopping = false;
async function stop(code=0) {
  if(stopping)return;
  stopping=true;
  if(application)await application.close();
  await Promise.all(children.map(child=>new Promise(resolve=>{
    if(child.exitCode!==null)return resolve();
    child.once('exit',resolve);child.kill('SIGTERM');
    setTimeout(()=>{if(child.exitCode===null)child.kill('SIGKILL');resolve();},5000).unref();
  })));
  process.exit(code);
}
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>stop());

try {
  for(const [name,port,noscripting] of [['main',54171,false],['noscripting',54172,true]]) {
    const dir = path.join(state,name);await mkdir(dir,{recursive:true});
    const child = spawn(process.env.MONGOD_BINARY ?? 'mongod',[
      '--dbpath',dir,'--port',String(port),'--bind_ip','127.0.0.1','--auth','--nounixsocket',
      '--logpath',path.join(dir,'mongod.log'),...(noscripting ? ['--noscripting'] : [])
    ],{stdio:['ignore','ignore','pipe']});
    children.push(child);
    let spawnError;
    child.on('error',err=>{spawnError=err;});
    child.stderr.on('data',data=>process.stderr.write(data));
    let connected=false;
    for(let i=0;i<50;i++) {
      if(spawnError)throw spawnError;
      if(child.exitCode!==null)throw new Error(`${name} mongod exited. Inspect ${dir}/mongod.log. No existing database is reused.`);
      const client = new MongoClient(`mongodb://127.0.0.1:${port}/admin`,{serverSelectionTimeoutMS:250});
      try {
        await client.connect();await client.db('admin').command({ping:1});
        try {await client.db('admin').command({createUser:'labadmin',pwd:secrets.admin,roles:[{role:'root',db:'admin'}]});}
        catch(err){ if(err.code !== 13 && err.code !== 51003)throw err; }
        connected=true;break;
      } catch(err) {await new Promise(r=>setTimeout(r,200));}
      finally {await client.close();}
    }
    if(!connected)throw new Error(`${name} database did not start`);
    const admin = new MongoClient(adminUri(port));await admin.connect();
    const db = admin.db('cs440_lab');
    for(const [user,pwd,role] of [['labapp',secrets.app,'readWrite'],['labreader',secrets.reader,'read']]) {
      try {await db.command({createUser:user,pwd,roles:[{role,db:'cs440_lab'}]});}
      catch(err){ if(err.code !== 51003)throw err; }
    }
    await seedDatabase(admin);
    await admin.close();
  }
  const config={main:appUri(54171),noscripting:appUri(54172),readonly:appUri(54171,'labreader'),port:4400,evidenceLog:path.join(root,'evidence','requests.ndjson')};
  await writeFile(path.join(state,'config.json'),JSON.stringify(config),{mode:0o600});
  application = await startApp(config);
  console.log('LOCAL LAB READY http://127.0.0.1:4400');
  console.log('Two dedicated authenticated databases on loopback ports 54171 and 54172. Ctrl+C stops this lab.');
} catch(err) { console.error('Lab startup failed:',err.message);await stop(1); }
