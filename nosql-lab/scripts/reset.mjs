import { readFile } from 'node:fs/promises';
import { MongoClient } from 'mongodb';
import { seedDatabase } from '../src/database.mjs';
const secrets = JSON.parse(await readFile(new URL('../.state/credentials.json',import.meta.url),'utf8'));
for(const port of [54171,54172]) {
  const client = new MongoClient(`mongodb://labadmin:${secrets.admin}@127.0.0.1:${port}/admin`);
  await client.connect();await seedDatabase(client);await client.close();
}
console.log('Reset only cs440_lab.users in the two dedicated local lab instances.');
