// Entry point copied into .build by rebuild.mjs so private runtime modules resolve.
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=process.cwd();
await fs.copyFile(path.join(root,'presentation/finalize-revised.mjs'),path.join(root,'.build/finalize-revised.mjs'));
process.env.REVEAL_PATCH ??= '1';
await import(pathToFileURL(path.join(root,'.build/finalize-revised.mjs')).href);
