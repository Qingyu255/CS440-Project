import test from 'node:test';
import assert from 'node:assert/strict';
import { MongoServerError } from 'mongodb';
import { probeScripting } from '../src/control-probes.mjs';

const rejected = error => ({ findOne: async () => { throw error; } });

test('disabled control accepts the specific MongoDB scripting rejection', async () => {
  const error = new MongoServerError({ code: 6108304, codeName: 'Location6108304', errmsg: 'Scripting disabled' });
  const observation = await probeScripting(rejected(error), { disabled: true });
  assert.equal(observation.whereAllowed, false);
  assert.equal(observation.whereErrorCode, 6108304);
});

test('disabled control fails if JavaScript unexpectedly executes', async () => {
  await assert.rejects(probeScripting({ findOne: async () => ({ username: 'alice' }) }, { disabled: true }));
});

test('network failure cannot count as evidence of disabled scripting', async () => {
  await assert.rejects(probeScripting(rejected(new Error('Connection lost')), { disabled: true }));
});

test('an unrelated MongoDB failure cannot count as disabled scripting', async () => {
  await assert.rejects(probeScripting(rejected(new MongoServerError({ code: 13, errmsg: 'Unauthorized' })), { disabled: true }));
});

test('an assertion failure cannot become a successful control observation', async () => {
  await assert.rejects(probeScripting(rejected(new assert.AssertionError({ message: 'Control unexpectedly succeeded' })), { disabled: true }));
});

test('enabled control must find Alice and propagates failed queries', async () => {
  assert.deepEqual(await probeScripting({ findOne: async () => ({ username: 'alice' }) }, { disabled: false }), { whereAllowed: true });
  await assert.rejects(probeScripting({ findOne: async () => null }, { disabled: false }));
  await assert.rejects(probeScripting(rejected(new Error('Connection lost')), { disabled: false }));
});
