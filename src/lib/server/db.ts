import { MongoClient } from 'mongodb';

// Deine Umgebungsvariable, z.B. MONGODB_URI (aus .env)
const uri = process.env.MONGODB_URI as string;
if (!uri) throw new Error('MONGODB_URI is not set in .env!');

// Optional: DB-Name, z.B. MONGODB_DB
const dbName = process.env.MONGODB_DB as string || 'myarmory';

const client = new MongoClient(uri);

export async function getDb() {
  if (typeof client.connect === 'function') {
    await client.connect();
  }
  return client.db(dbName);
}
