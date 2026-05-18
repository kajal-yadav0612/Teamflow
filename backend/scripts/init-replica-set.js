/**
 * Prisma + MongoDB requires a replica set (even for local dev).
 * Run once after configuring mongod with replSetName: rs0
 */
import { MongoClient } from 'mongodb';

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/team_task_manager';

async function main() {
  const client = new MongoClient('mongodb://localhost:27017');
  try {
    await client.connect();
    const admin = client.db('admin');

    try {
      const status = await admin.command({ replSetGetStatus: 1 });
      if (status.ok === 1) {
        console.log('Replica set is already running.');
        console.log('\nUse this DATABASE_URL in backend/.env:');
        console.log('DATABASE_URL="mongodb://localhost:27017/team_task_manager?replicaSet=rs0"');
        return;
      }
    } catch {
      // not initialized yet
    }

    console.log('Initializing replica set "rs0"...');
    await admin.command({
      replSetInitiate: {
        _id: 'rs0',
        members: [{ _id: 0, host: 'localhost:27017' }],
      },
    });

    console.log('\nSuccess! Add this to backend/.env:');
    console.log('DATABASE_URL="mongodb://localhost:27017/team_task_manager?replicaSet=rs0"');
    console.log('\nThen restart the API: npm run dev');
  } catch (err) {
    console.error('\nCould not initialize replica set:', err.message);
    console.log(`
━━━ Fix: enable replica set on local MongoDB ━━━

1. Find your MongoDB config file (mongod.cfg), often at:
   C:\\Program Files\\MongoDB\\Server\\<version>\\bin\\mongod.cfg

2. Add these lines (or update the replication section):

   replication:
     replSetName: rs0

3. Restart the "MongoDB Server" service:
   - Press Win+R → type services.msc → Enter
   - Find "MongoDB Server" → Right-click → Restart

4. Run again:
   npm run db:replica-init

5. Update backend/.env with the URL shown above, then npm run dev

━━━ Easier alternative: MongoDB Atlas (free) ━━━
Atlas includes a replica set automatically.
https://www.mongodb.com/cloud/atlas
Paste your mongodb+srv://... URL into backend/.env as DATABASE_URL
`);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
