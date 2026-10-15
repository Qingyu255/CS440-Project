import { MongoClient } from 'mongodb';
import { hashPassword } from './passwords.mjs';

export const accounts = [
  { username: 'alice', password: 'Alice-Lab-Only-440!', role: 'student', note: 'Alice: private synthetic project notes' },
  { username: 'bob', password: 'Bob-Lab-Only-440!', role: 'student', note: 'Bob: private synthetic project notes' },
  { username: 'carol', password: 'Carol-Lab-Only-440!', role: 'administrator', note: 'Carol: synthetic admin-only notes' }
];

export async function seedDatabase(client) {
  const db = client.db('cs440_lab');
  // Only the dedicated lab's synthetic collection is reset.
  await db.collection('users').deleteMany({});
  await db.collection('users').createIndex({ username: 1 }, { unique: true });
  const records = [];
  for (const a of accounts) records.push({ ...a, passwordHash: await hashPassword(a.password) });
  await db.collection('users').insertMany(records);
  await db.collection('accounts_hashed').deleteMany({});
  await db.collection('accounts_hashed').createIndex({ username: 1 }, { unique: true });
  await db.collection('accounts_hashed').insertMany(records.map(({password,...record})=>record));
}

export function clientFor(uri) {
  return new MongoClient(uri, { serverSelectionTimeoutMS: 3000, monitorCommands: true });
}
