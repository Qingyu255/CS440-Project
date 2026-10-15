import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for(const key of ['PRESENTATIONS_SKILL_DIR','RUNTIME_NODE_MODULES','RUNTIME_NODE','RUNTIME_PYTHON']) {
  if(!process.env[key]) throw new Error(`Set ${key} using the Codex workspace dependency paths. See presentation/README.md.`);
}
const build=path.join(root,'.build');await fs.mkdir(build,{recursive:true});
const modules=path.join(build,'node_modules');
try { const entry=await fs.lstat(modules); if(!entry.isSymbolicLink())throw new Error('Private build/node_modules must be a runtime symlink');await fs.unlink(modules); } catch(error){if(error.code!=='ENOENT')throw error;}
await fs.symlink(process.env.RUNTIME_NODE_MODULES,modules,'dir');
const entry=path.join(build,'author-deck.mjs');await fs.copyFile(path.join(root,'presentation/build-deck.mjs'),entry);
const result=spawnSync(process.env.RUNTIME_NODE,[entry],{cwd:root,stdio:'inherit',env:process.env});
if(result.error)throw result.error;
process.exitCode=result.status??1;
