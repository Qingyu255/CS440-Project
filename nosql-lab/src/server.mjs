import express from 'express';
import { randomBytes } from 'node:crypto';
import { appendFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { clientFor } from './database.mjs';
import { hashPassword, verifyPassword } from './passwords.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const modeIds = ['baseline', 'noscripting', 'readonly', 'validated', 'hardened'];
const labels = {
  baseline: 'Vulnerable baseline', noscripting: 'JavaScript disabled',
  readonly: 'Read-only DB account', validated: 'String validation only',
  hardened: 'Validated + hash verification'
};

// Redact ordinary credential strings while preserving injected syntax for teaching.
export function redact(value, key = '') {
  if (key === 'passwordHash') return '[REDACTED]';
  if (key === 'password' && typeof value === 'string') return '[REDACTED STRING]';
  if (Array.isArray(value)) return value.map(v => redact(v));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, redact(v,k)]));
  return value;
}

function validContract(body) {
  return body && typeof body === 'object' && !Array.isArray(body)
    && Object.keys(body).length === 2
    && Object.keys(body).every(k => k === 'username' || k === 'password')
    && typeof body.username === 'string' && body.username.length >= 1 && body.username.length <= 64
    && typeof body.password === 'string' && body.password.length >= 1 && body.password.length <= 256;
}

export async function startApp(config) {
  const clients = {};
  for (const id of ['main','noscripting','readonly']) {
    clients[id] = clientFor(config[id]);
    await clients[id].connect();
  }
  const info = await clients.main.db('admin').command({ buildInfo: 1 });
  const pendingTraces = new Map();
  for (const client of Object.values(clients)) client.on('commandStarted', event => {
    if (event.commandName === 'find') {
      const trace = pendingTraces.get(event.command.comment);
      if (trace) trace.findCommands++;
    }
  });
  const app = express();
  app.disable('x-powered-by');
  app.use((req,res,next) => {
    res.set('Cache-Control','no-store');
    res.set('X-Content-Type-Options','nosniff');
    res.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'none'");
    const host = req.get('host')?.split(':')[0];
    if (!['127.0.0.1','localhost','[::1]'].includes(host)) return res.status(403).json({error:'Local lab host required'});
    const origin = req.get('origin');
    if (origin && origin !== `http://${req.get('host')}`) return res.status(403).json({error:'Same-origin lab request required'});
    next();
  });
  app.use(express.json({ limit: '8kb', strict: true }));
  app.use(express.static(path.join(root,'public')));
  const sessions = new Map();
  const history = [];
  const dummyHash = await hashPassword('Nonexistent-Account-Synthetic-Password');
  function revoke(req,res) {
    const token = req.headers.cookie?.match(/(?:^|;\s*)cs440_session=([a-f0-9]{64})(?:;|$)/)?.[1];
    if(token) sessions.delete(token);
    res.cookie('cs440_session','',{ httpOnly:true,sameSite:'strict',maxAge:0,path:'/' });
  }
  app.get('/api/health', (req,res) => res.json({ ready: true, database: info.version, node: process.version, modes: labels }));
  app.get('/api/evidence', (req,res) => res.json(history.slice(-60)));
  app.post('/api/logout', (req,res) => {revoke(req,res);res.json({ok:true});});
  app.post('/api/login/:mode', async (req,res,next) => {
    const mode = req.params.mode;
    if(!modeIds.includes(mode)) return res.status(404).json({error:'Unknown configuration'});
    revoke(req,res);
    const trace = { id: randomBytes(8).toString('hex'), mode, request: redact(req.body), databaseQueried: false, findCommands: 0, filter: null, authenticated: false, account: null };
    pendingTraces.set(trace.id, trace);
    async function finish(status,body) {
      trace.status = status;
      pendingTraces.delete(trace.id);
      history.push(trace);
      if(history.length > 200) history.shift();
      if(config.evidenceLog) await appendFile(config.evidenceLog,JSON.stringify(trace)+'\n');
      res.status(status).json({...body,trace});
    }
    try {
      if ((mode === 'validated' || mode === 'hardened') && !validContract(req.body)) {
        return await finish(400,{error:'Credential contract rejected'});
      }
      const client = mode === 'noscripting' ? clients.noscripting : mode === 'readonly' ? clients.readonly : clients.main;
      const filter = mode === 'hardened' ? {username:req.body.username} : {username:req.body.username,password:req.body.password};
      trace.filter = redact(filter);
      trace.databaseQueried = true;
      const account = await client.db('cs440_lab').collection(mode === 'hardened' ? 'accounts_hashed' : 'users').findOne(filter, { comment: trace.id });
      let authenticated = Boolean(account);
      if(mode === 'hardened') authenticated = await verifyPassword(req.body.password,account?.passwordHash ?? dummyHash) && Boolean(account);
      if(!authenticated) return await finish(401,{error:'Invalid credentials'});
      trace.authenticated = true;
      trace.account = account.username;
      const token = randomBytes(32).toString('hex');
      sessions.set(token,{username:account.username,note:account.note,role:account.role,mode,expires:Date.now()+10*60*1000});
      res.cookie('cs440_session',token,{ httpOnly:true,sameSite:'strict',maxAge:10*60*1000,path:'/' });
      // Secure cookies require HTTPS. This loopback teaching service deliberately uses HTTP.
      await finish(200,{message:'Session created',account:account.username});
    } catch(err) {
      trace.databaseError = err.codeName ?? err.name;
      await finish(422,{error:'Database rejected the lab predicate'});
    }
  });
  app.get('/api/protected', (req,res) => {
    const token = req.headers.cookie?.match(/(?:^|;\s*)cs440_session=([a-f0-9]{64})(?:;|$)/)?.[1];
    const session = sessions.get(token);
    if(!session || session.expires < Date.now()) { if(token)sessions.delete(token); return res.status(401).json({error:'Authentication required'}); }
    res.json({username:session.username,role:session.role,note:session.note,mode:session.mode});
  });
  app.use((err,req,res,next) => res.status(err.status === 413 ? 413 : 400).json({error:'Invalid JSON request'}));
  const server = await new Promise((resolve,reject) => {
    const s = app.listen(config.port ?? 4400,'127.0.0.1',()=>resolve(s));
    s.on('error',reject);
  });
  return { server, clients, async close(){ await new Promise(r=>server.close(r));await Promise.all(Object.values(clients).map(c=>c.close())); } };
}

if(process.argv[1] === fileURLToPath(import.meta.url)) {
  const config = JSON.parse(await readFile(path.join(root,'.state','config.json'),'utf8'));
  const running = await startApp(config);
  console.log('Lab ready: http://127.0.0.1:'+ (config.port ?? 4400));
  for(const signal of ['SIGINT','SIGTERM']) process.on(signal,async()=>{await running.close();process.exit(0);});
}
