import type { RequestHandler } from '@sveltejs/kit';
import { MongoClient } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';

// Funktion für die Verbindung zur DB
async function connectToDatabase() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client.db('wowdb'); // Passe ggf. an
}

// --------- GET: Gilde aus DB oder Raider.IO laden ---------
export const GET: RequestHandler = async ({ params }) => {
  const region = params.region.toLowerCase();
  const realm = params.realm.trim().toLowerCase().replace(/ /g, '-');
  const name = params.name.trim();

  const db = await connectToDatabase();
  const collection = db.collection('guilds');

  const guildKey = `${region}-${realm}-${name}`.toLowerCase();

  // Versuche, Gilde aus DB zu holen
  let guild = await collection.findOne({ _id: guildKey });

  if (!guild) {
    // Wenn nicht gefunden, hole von Raider.IO
    const url = `https://raider.io/api/v1/guilds/profile?region=${region}&realm=${encodeURIComponent(realm)}&name=${encodeURIComponent(name)}&fields=raid_progression,raid_rankings,mythic_plus_rankings`;
    const response = await fetch(url);

    if (!response.ok) {
      return new Response('Guild not found', { status: 404 });
    }

    guild = await response.json();
    guild._id = guildKey;
    await collection.insertOne(guild);
  }

  return new Response(JSON.stringify(guild), {
    headers: { 'Content-Type': 'application/json' }
  });
};

// --------- DELETE: Gilde aus DB löschen ---------
//Funktion auf der Website nicht umgesetzt
export const DELETE: RequestHandler = async ({ params }) => {
  const region = params.region.toLowerCase();
  const realm = params.realm.trim().toLowerCase().replace(/ /g, '-');
  const name = params.name.trim();

  const db = await connectToDatabase();
  const collection = db.collection('guilds');

  const guildKey = `${region}-${realm}-${name}`.toLowerCase();

  const result = await collection.deleteOne({ _id: guildKey });

  if (result.deletedCount === 1) {
    return new Response(JSON.stringify({ message: 'Deleted' }), { status: 200 });
  } else {
    return new Response(JSON.stringify({ message: 'Not found' }), { status: 404 });
  }
};
