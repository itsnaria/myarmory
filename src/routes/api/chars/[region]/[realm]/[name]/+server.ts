import type { RequestHandler } from '@sveltejs/kit';
import { MongoClient } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';

async function connectToDatabase() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client.db('wowdb');
}

export const DELETE: RequestHandler = async ({ params }) => {
  const region = params.region.toLowerCase();
  const realmParam = params.realm.trim().toLowerCase().replace(/ /g, '-');
  const name = params.name.trim();

  // Realm-Regex: Erlaubt Bindestrich oder Leerzeichen, case-insensitive
  const realmRegex = new RegExp('^' + realmParam.replace('-', '[\\s-]?') + '$', 'i');

  const db = await connectToDatabase();
  const collection = db.collection('characters');

  const result = await collection.deleteOne({
    region: new RegExp('^' + region + '$', 'i'),
    realm: realmRegex,
    name: new RegExp('^' + name + '$', 'i')
  });

  console.log("Lösche mit:", {
    region: new RegExp('^' + region + '$', 'i'),
    realm: realmRegex,
    name: new RegExp('^' + name + '$', 'i')
  });
  console.log("Ergebnis:", result);

  if (result.deletedCount === 1) {
    return new Response(JSON.stringify({ message: 'Deleted' }), { status: 200 });
  } else {
    return new Response(JSON.stringify({ message: 'Not found' }), { status: 404 });
  }
};

