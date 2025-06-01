<script lang="ts">
  import RealmSelect from './RealmSelect.svelte';
  import { goto } from '$app/navigation';

  //Legt die Standardwerte für Region, Realm und Charakter fest
  //Region ist standardmäßig auf 'eu' gesetzt, Realm und Charakter sind leer

  let region = 'eu';
  let realm = '';
  let character = '';

  // Funktion zum Handhaben des Formular-Submit-Ereignisses
  // Überprüft, ob alle Felder ausgefüllt sind und sendet die Daten an den Server
  // Bei Erfolg wird der Benutzer zur Übersicht weitergeleitet, andernfalls wird eine Fehlermeldung angezeigt
  const handleSubmit = async () => {
    if (!region || !realm || !character) {
      alert('Bitte alle Felder ausfüllen!');
      return;
    }

    // Sendet die eingegebenen Daten an den Server
    // und erwartet eine JSON-Antwort

    const res = await fetch('/api/add-character', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ region, realm, character })
    });
    const data = await res.json();

    if (data.success) {
      goto(`/overview?region=${encodeURIComponent(region)}&realm=${encodeURIComponent(realm)}&char=${encodeURIComponent(character)}`);
    } else {
      alert(data.error || 'Charakter konnte nicht importiert werden.');
    }
  };
</script>


<h1 class="headline">Enter realm and character</h1>
<form on:submit|preventDefault={handleSubmit} autocomplete="off">
  <div class="form-row">
    <label class="form-label" for="region-select">Region</label>
    <select
      id="region-select"
      class="form-input"
      bind:value={region}
    >
      <option value="eu">EU</option>
      <option value="us">US</option>
    </select>
  </div>
  <div class="form-row">
    <label class="form-label" for="realm-select">Realm</label>
    <RealmSelect {region} bind:value={realm} />
  </div>
  <div class="form-row">
    <label class="form-label" for="character-input">Character</label>
    <input
      class="form-input"
      id="character-input"
      type="text"
      bind:value={character}
      placeholder="Enter character name..."
      autocomplete="off"
    />
  </div>
  <div class="submit-row">
    <button class="submit-btn" type="submit">Go</button>
  </div>
</form>


<style>
.headline {
  font-size: 2.4rem;
  color: #fff;
  font-weight: 600;
  margin-bottom: 36px;
}
.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 22px;
}
.form-label {
  flex: 0 0 110px;
  color: #fff;
  font-size: 1.3rem;
  font-weight: 600;
  margin-right: 16px;
}
.form-input {
  flex: 1 1 auto;
  width: 100%;
  background: #181818;
  color: #fff;
  border: 1px solid #333;
  padding: 13px 14px;
  border-radius: 6px;
  font-size: 1.1rem;
  box-sizing: border-box;
}
.submit-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}
.submit-btn {
  background: #3571a5;
  color: #fff;
  border: none;
  font-size: 1.35rem;
  font-weight: 500;
  border-radius: 6px;
  padding: 8px 30px;
  cursor: pointer;
  box-shadow: 0 3px 18px 0 #0006;
  transition: background 0.17s;
}
.submit-btn:hover {
  background: #285480;
}
</style>
