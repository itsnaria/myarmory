import { json } from '@sveltejs/kit';
import { MongoClient } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';

// GET-Handler zum Abrufen aller Charaktere
// Diese Funktion holt alle Charaktere aus der MongoDB und gibt sie als JSON zurück
export async function GET() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('wowdb');
  const chars = db.collection('characters');
  const allChars = await chars.find({}).toArray();
  await client.close();

  return json(allChars);
}
