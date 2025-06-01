import { json } from '@sveltejs/kit';
import { MongoClient } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';

// Hilfsfunktion: Charakter prüfen und Raider.IO API aufrufen
async function checkArmory(region: string, realm: string, character: string): Promise<Record<string, any> | null> {
  
  // Realm für API anpassen (klein und mit Bindestrich)
  const safeRealm = realm.trim().replace(/ /g, '-').toLowerCase();
  const safeName = character.trim(); // ggf. .toLowerCase() falls nötig
    const fields = [
    'gear',
    'guild',
    'raid_progression',
    'mythic_plus_scores_by_season:current'
  ].join(',');

  // Raider.IO API URL
  const url = `https://raider.io/api/v1/characters/profile?region=${region}&realm=${safeRealm}&name=${safeName}&fields=${fields}`;
  console.log('RaiderIO-URL:', url);

  const resp = await fetch(url);

  if (resp.status === 200) {
    return await resp.json(); // Char existiert!
  } else {
    const errText = await resp.text();
    console.error('RaiderIO API Error:', errText);
    return null;
  }
}

// POST-Handler für das Hinzufügen eines Charakters
export async function POST({ request }) {
  const { region, realm, character } = await request.json();

  // Raider.IO-Daten holen (jetzt als JSON)
  const charData = await checkArmory(region, realm, character);

  if (!charData) {
    return json(
      { success: false, error: 'Character not found (raider.io).' },
      { status: 404 }
    );
  }

//Daten, die in MongoDB gespeichert werden sollen
const entry = {
  name: charData.name,
  race: charData.race,
  class: charData.class,
  active_spec_name: charData.active_spec_name,
  active_spec_role: charData.active_spec_role,
  gender: charData.gender,
  faction: charData.faction,
  achievement_points: charData.achievement_points,
  region: charData.region,
  realm: charData.realm,
  profile_url: charData.profile_url,
  guild: charData.guild?.name,
  item_level: charData.gear?.item_level_equipped,
  raid_progression: charData.raid_progression,
  mythic_plus_score: (charData.mythic_plus_scores_by_season?.[0]?.scores?.all),
  thumbnail_url: charData.thumbnail_url || null,
  createdAt: new Date()
};


  // ======= MongoDB Zugriff vorbereiten =======
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('wowdb');
  const chars = db.collection('characters');

  
  await chars.updateOne(
    { region: entry.region, realm: entry.realm, name: entry.name }, // NICHT character!
    { $set: entry },
    { upsert: true }
  );
  //Debug-Ausgabe
  console.log("MongoDB update erfolgreich", entry);

  await client.close();

  return json({ success: true });
}
