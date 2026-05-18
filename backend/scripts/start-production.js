/**
 * Production start — finds a working MongoDB URL, syncs schema, starts API.
 */
import { execSync } from 'child_process';
import { MongoClient } from 'mongodb';
import 'dotenv/config';

function buildUrlVariants(raw) {
  const variants = new Set();
  const base = raw.trim();

  if (!base.startsWith('mongodb')) return variants;

  variants.add(base);

  // Host + credentials only (strip path/query)
  const hostMatch = base.match(/^(mongodb(?:\+srv)?:\/\/[^/]+)/);
  if (hostMatch) {
    const host = hostMatch[1];
    variants.add(`${host}/team_task_manager`);
    variants.add(`${host}/team_task_manager?authSource=admin`);
    variants.add(`${host}/team_task_manager?directConnection=true&authSource=admin`);
  }

  // Replace existing database name in path
  if (base.includes('/')) {
    const replaced = base.replace(/\/[^/?]+(\?|$)/, '/team_task_manager$1');
    variants.add(replaced);
    if (!replaced.includes('authSource')) {
      variants.add(replaced.includes('?') ? `${replaced}&authSource=admin` : `${replaced}?authSource=admin`);
    }
  } else {
    variants.add(`${base}/team_task_manager`);
    variants.add(`${base}/team_task_manager?authSource=admin`);
  }

  return [...variants];
}

function collectRawUrls() {
  const keys = [
    'DATABASE_URL',
    'MONGO_PRIVATE_URL',
    'MONGO_URL',
    'MONGODB_URL',
    'MONGO_PUBLIC_URL',
  ];

  return keys
    .map((k) => process.env[k]?.trim())
    .filter((u) => u && u.startsWith('mongodb') && !u.includes('${{'));
}

async function findWorkingUrl() {
  const rawUrls = collectRawUrls();
  const candidates = rawUrls.flatMap(buildUrlVariants);

  if (candidates.length === 0) {
    return null;
  }

  for (const url of candidates) {
    const client = new MongoClient(url, { serverSelectionTimeoutMS: 10000 });
    try {
      await client.connect();
      await client.db('team_task_manager').command({ ping: 1 });
      await client.close();
      return url;
    } catch {
      try {
        await client.close();
      } catch {
        /* ignore */
      }
    }
  }

  return null;
}

const databaseUrl = await findWorkingUrl();

if (!databaseUrl) {
  console.error('\n========================================');
  console.error('  Could not connect to MongoDB');
  console.error('========================================\n');
  console.error('On Railway → gallant-warmth → Variables:\n');
  console.error('1. Open MongoDB service → Variables → copy MONGO_URL');
  console.error('2. On gallant-warmth add variable:');
  console.error('   Name:  MONGO_URL');
  console.error('   Value: (paste exact copy from MongoDB — do not edit password)\n');
  console.error('3. Redeploy gallant-warmth\n');
  process.exit(1);
}

process.env.DATABASE_URL = databaseUrl;
console.log('MongoDB connected. Syncing schema...');

try {
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit', env: process.env });
} catch (err) {
  console.error('Schema sync failed:', err.message);
  process.exit(1);
}

console.log('Starting API...');
await import('../src/server.js');
