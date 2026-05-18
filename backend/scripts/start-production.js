/**
 * Production start — builds DATABASE_URL from Railway MongoDB vars if needed.
 */
import { execSync } from 'child_process';
import 'dotenv/config';

function ensureDatabaseName(urlString) {
  const parsed = new URL(urlString);
  parsed.pathname = '/team_task_manager';
  return parsed.href;
}

function resolveDatabaseUrl() {
  const direct = process.env.DATABASE_URL?.trim();

  if (direct && direct.startsWith('mongodb') && !direct.includes('${{')) {
    return direct.includes('team_task_manager') ? direct : ensureDatabaseName(direct);
  }

  // Prefer private URL (same Railway network) — public URL often causes auth issues
  const candidates = [
    process.env.MONGO_PRIVATE_URL,
    process.env.MONGO_URL,
    process.env.MONGODB_URL,
    process.env.MONGO_PUBLIC_URL,
  ].filter(Boolean);

  for (const raw of candidates) {
    const url = raw.trim();
    if (url.startsWith('mongodb')) {
      return url.includes('team_task_manager') ? url : ensureDatabaseName(url);
    }
  }

  return null;
}

const databaseUrl = resolveDatabaseUrl();

if (!databaseUrl) {
  console.error('\n========================================');
  console.error('  DATABASE_URL / MONGO_URL not found');
  console.error('========================================\n');
  console.error('Do ONE of these on Railway:\n');
  console.error('OPTION A — Link MongoDB (easiest):');
  console.error('  1. Click MongoDB service');
  console.error('  2. Click "Connect" or "Variables" → "Service Variables"');
  console.error('  3. Connect to gallant-warmth (your backend)');
  console.error('  4. Redeploy gallant-warmth\n');
  console.error('OPTION B — Manual variable:');
  console.error('  1. MongoDB → Variables → copy MONGO_URL');
  console.error('  2. gallant-warmth → Variables → add DATABASE_URL');
  console.error('  3. Value = <paste>/team_task_manager\n');
  process.exit(1);
}

process.env.DATABASE_URL = databaseUrl;
console.log('Database URL configured for team_task_manager');

try {
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit', env: process.env });
} catch {
  console.error('\nCould not connect to MongoDB. Check MONGO_URL and that MongoDB is Online.\n');
  process.exit(1);
}

console.log('Starting API...');
await import('../src/server.js');
