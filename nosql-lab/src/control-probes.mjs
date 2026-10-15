import assert from 'node:assert/strict';
import { MongoServerError } from 'mongodb';

// This harmless predicate checks the configuration, separately from operator injection.
export async function probeScripting(collection, { disabled }) {
  const query = { $where: 'this.username === "alice"' };
  if (!disabled) {
    const account = await collection.findOne(query);
    assert.equal(account?.username, 'alice', 'Enabled scripting must execute the probe');
    return { whereAllowed: true };
  }

  let observed;
  // Keep the assertion outside a catch: unexpected success must fail the experiment.
  await assert.rejects(() => collection.findOne(query), error => {
    assert.ok(error instanceof MongoServerError, 'Require an actual MongoDB server rejection');
    assert.equal(error.code, 6108304, 'Require the scripting-disabled error, not a connection or assertion failure');
    observed = error;
    return true;
  });
  return { whereAllowed: false, whereError: observed.codeName ?? observed.name, whereErrorCode: observed.code };
}
