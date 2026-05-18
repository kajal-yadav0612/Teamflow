/**
 * Production start — validates DATABASE_URL before Prisma + API start.
 */
import { execSync } from 'child_process';
import 'dotenv/config';

const url = process.env.DATABASE_URL?.trim();

if (!url || url.includes('${{') || !url.startsWith('mongodb')) {
  console.error('\n========================================');
  console.error('  DATABASE_URL is missing or invalid');
  console.error('========================================\n');
  console.error('Fix on Railway (gallant-warmth → Variables):\n');
  console.error('  1. Open your MongoDB service → Variables');
  console.error('  2. Copy the full MONGO_URL value');
  console.error('  3. On backend, set DATABASE_URL to:');
  console.error('     <paste MONGO_URL>/team_task_manager');
  console.error('\n  Example:');
  console.error('  mongodb://mongo:pass@host:port/team_task_manager\n');
  process.exit(1);
}

console.log('Starting TeamFlow API...');
console.log('Database configured.');

try {
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
} catch {
  console.error('\nPrisma db push failed. Check DATABASE_URL connects to MongoDB.\n');
  process.exit(1);
}

import('../src/server.js');
