/**
 * Local dev: starts an in-memory MongoDB replica set (required by Prisma),
 * syncs schema, then runs the API with --watch.
 */
import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(__dirname, '..');

let replSet;

async function main() {
  console.log('Starting in-memory MongoDB (replica set)...');
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  });
  await replSet.waitUntilRunning();

  const baseUri = replSet.getUri();
  const parsed = new URL(baseUri);
  parsed.pathname = '/team_task_manager';
  const databaseUrl = parsed.href;

  process.env.DATABASE_URL = databaseUrl;
  console.log('Database ready.\n');

  const env = { ...process.env, DATABASE_URL: databaseUrl };

  console.log('Syncing Prisma schema...');
  execSync('npx prisma db push --skip-generate', { cwd: backendRoot, env, stdio: 'inherit' });
  execSync('npx prisma generate', { cwd: backendRoot, env, stdio: 'inherit' });

  console.log('\nStarting API on http://localhost:5000\n');
  const child = spawn(process.execPath, ['--watch', 'src/server.js'], {
    cwd: backendRoot,
    env,
    stdio: 'inherit',
  });

  const shutdown = async () => {
    child.kill();
    if (replSet) await replSet.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  child.on('exit', async (code) => {
    if (replSet) await replSet.stop();
    process.exit(code ?? 0);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
