import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { modeIds } from '../src/server.mjs';

const base = 'http://127.0.0.1:4400';
const results = [];
let httpChecks = 0;
const valid = { username: 'alice', password: 'Alice-Lab-Only-440!' };
const attack = { username: 'alice', password: { $ne: '' } };
async function request(path, options) { httpChecks++; return fetch(base + path, options); }
async function login(mode, body, cookie) {
  return request('/api/login/' + mode, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, body: JSON.stringify(body) });
}
function sessionCookie(response) {
  const value = response.headers.getSetCookie().find(c => /^cs440_session=[a-f0-9]{64};/.test(c));
  assert.ok(value, 'Successful login must provide a usable session cookie');
  return value.split(';')[0];
}

for (const mode of modeIds) {
  const success = await login(mode, valid);
  assert.equal(success.status, 200);
  const oldCookie = sessionCookie(success);
  assert.equal((await request('/api/protected', { headers: { Cookie: oldCookie } })).status, 200);
  const failed = await login(mode, { ...valid, password: 'wrong-password' }, oldCookie);
  assert.equal(failed.status, 401);
  assert.equal((await request('/api/protected', { headers: { Cookie: oldCookie } })).status, 401, `${mode}: old session must actually be revoked`);
  results.push({ check: 'failed-login-revokes-existing-session', mode, passed: true });
}
for (const mode of ['validated', 'hardened']) {
  const success = await login(mode, valid);
  assert.equal(success.status, 200);
  const oldCookie = sessionCookie(success);
  const rejected = await login(mode, attack, oldCookie);
  assert.equal(rejected.status, 400);
  assert.equal((await rejected.json()).trace.findCommands, 0);
  assert.equal((await request('/api/protected', { headers: { Cookie: oldCookie } })).status, 401);
  results.push({ check: 'contract-rejection-revokes-existing-session', mode, passed: true });
}
for (const mode of modeIds) {
  const response = await request('/api/login/' + mode, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(valid) });
  assert.equal(response.status, 415);
  assert.equal((await response.json()).trace.findCommands, 0);
  results.push({ check: 'JSON-content-type-required-before-find', mode, passed: true });
}
const success = await login('hardened', valid);
assert.equal(success.status, 200);
const oldCookie = sessionCookie(success);
assert.equal((await request('/api/logout', { method: 'POST', headers: { Cookie: oldCookie } })).status, 200);
assert.equal((await request('/api/protected', { headers: { Cookie: oldCookie } })).status, 401);
results.push({ check: 'logout-invalidates-token', passed: true });
const tooLarge = await request('/api/login/hardened', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...valid, padding: 'x'.repeat(9000) }) });
assert.equal(tooLarge.status, 413);
results.push({ check: 'request-size-limit', passed: true });
const duplicateRunner = spawnSync(process.execPath, ['scripts/run-local.mjs'], { cwd: new URL('..', import.meta.url), encoding: 'utf8', timeout: 15000 });
assert.equal(duplicateRunner.status, 1);
assert.match(duplicateRunner.stderr, /Port 4400 unavailable.*No database was contacted/);
results.push({ check: 'occupied-port-refuses-start-before-database-contact', passed: true });
await fs.writeFile(new URL('../evidence/regressions.json', import.meta.url), JSON.stringify({ schemaVersion: 1, recordedAt: new Date().toISOString(), httpChecks, checkCount: results.length, results }, null, 2) + '\n');
console.log(`PASS: ${results.length} supplementary regression scenarios / ${httpChecks} HTTP checks, plus occupied-port subprocess check.`);
