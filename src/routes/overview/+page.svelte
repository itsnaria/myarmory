<script lang="ts">
  import { onMount } from 'svelte';
  import { selectedChar } from '$lib/stores/selectedChar';
  import { goto } from '$app/navigation';


  let chars = [];
  let selected = 0;

  // Farben für Klassen
  const CLASS_COLORS = {
    'Death Knight': '#C41F3B',
    'Demon Hunter': '#A330C9',
    'Druid': '#FF7D0A',
    'Evoker': '#33937F',
    'Hunter': '#ABD473',
    'Mage': '#69CCF0',
    'Monk': '#00FF96',
    'Paladin': '#F58CBA',
    'Priest': '#FFFFFF',
    'Rogue': '#FFF569',
    'Shaman': '#0070DE',
    'Warlock': '#9482C9',
    'Warrior': '#C79C6E'
  };

  // Funktion zum Abrufen der Klassenfarbe
  function getClassColor(className) {
    return CLASS_COLORS[className] ?? '#bbb';
  }

  // --- Laden der Charaktere ---
  // Beim Mounten der Komponente die Charaktere laden
  onMount(async () => {
    const res = await fetch('/api/chars');
    chars = await res.json();
    // Optional: Wenn chars vorhanden, sofort ersten auswählen:
    if (chars.length > 0) selectedChar.set(chars[selected]);
  });

  // Funktion zum Auswählen eines Charakters
  // Setzt den ausgewählten Charakter und aktualisiert den Store
  function selectChar(idx) {
    selected = idx;
    selectedChar.set(chars[selected]);
  }

  // Funktion zum Formatieren des Raid-Namens
  // Wandelt den Slug in einen lesbaren Namen um
  function prettyRaidName(slug) {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // --- Refresh & Delete Feature ---
  let showConfirm = false;
  let charToDelete = null;

  // Funktion zum Aktualisieren eines Charakters
  // Ruft die API auf, um die neuesten Daten zu laden
  function refreshChar(char, idx) {
    fetch(`/api/chars/${char.region}/${encodeURIComponent(char.realm)}/${encodeURIComponent(char.name)}?forceUpdate=1`)
      .then(r => r.json())
      .then(data => {
        chars[idx] = data;
        // Wenn gerade selektiert, Details auch aktualisieren!
        if (selected === idx) selectedChar.set(data);
      });
  }

  // Funktion zum Bestätigen der Löschung eines Charakters
  function confirmDelete(char, idx) {
    charToDelete = { ...char, idx };
    showConfirm = true;
  }

// Funktion zum Löschen eines Charakters
function deleteCharConfirmed() {
  if (!charToDelete) return;
  fetch(`/api/chars/${charToDelete.region}/${encodeURIComponent(charToDelete.realm)}/${encodeURIComponent(charToDelete.name)}`, { method: 'DELETE' })
    .then(() => {
      chars.splice(charToDelete.idx, 1);
      chars = [...chars];
      if (chars.length > 0) {
        if (selected >= chars.length) selected = chars.length - 1;
        selectedChar.set(chars[selected]);
      } else {
        selected = -1;
        selectedChar.set(null);
        goto('/'); // Hier der Redirect!
      }
      charToDelete = null;
      showConfirm = false;
    });
}

// Funktion zum Abbrechen der Löschung
  function cancelDelete() {
    showConfirm = false;
    charToDelete = null;
  }
</script>

{#if chars.length === 0}
  <p>Keine Charaktere gespeichert.</p>
{:else}
  <div class="main-layout">
    <!-- Sidebar -->
    <div class="sidebar">
      {#each chars as char, idx}
        <div
          class="sidebar-item {selected === idx ? 'selected' : ''}"
          on:click={() => selectChar(idx)}
        >
          <span style="color:{getClassColor(char.class)}">{char.name}</span>
          <button
            class="icon-btn"
            title="Charakter löschen"
            on:click|stopPropagation={() => confirmDelete(char, idx)}
          >
            <!-- Trash Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 24 24">
              <path stroke="#ff9191" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      {/each}
    </div>

    <!-- Char Details -->
    <div class="char-details">
      {#if chars[selected]}
        <div class="char-detail-container">
          <img src={chars[selected].thumbnail_url ? chars[selected].thumbnail_url : '/fallback.png'} alt={chars[selected].name} width="200" height="200" style="border-radius:8px;margin-bottom:8px;">
          <div class="char-info">
            <div class="char-name">
              <strong>{chars[selected].name}</strong> <span class="class-race">({chars[selected].class} - {chars[selected].race})</span>
            </div>
            <div><b>Realm:</b> {chars[selected].realm} [{chars[selected].region}]</div>
            <div><b>Spec:</b> {chars[selected].active_spec_name}</div>
            <div><b>Faction:</b> {chars[selected].faction.charAt(0).toUpperCase() + chars[selected].faction.slice(1)}</div>
            <div><b>Erfolge:</b> {chars[selected].achievement_points}</div>
            <div><b>Gilde:</b> {chars[selected].guild ?? '-'}</div>
            <div><b>Itemlevel:</b> {chars[selected].item_level ?? '-'}</div>
            <div class="raid-prog-title"><b>Raid Progression:</b></div>
            <ul class="raid-list">
              {#each Object.entries(chars[selected].raid_progression ?? {}) as [raid, prog]}
                <li>
                  <b>{prettyRaidName(raid)}:</b> {prog.summary}
                 </li>
              {/each}
            </ul>
            <div class="mplus-score">
              <b>Mythic+ Score:</b> {chars[selected].mythic_plus_score ?? '-'}
            </div>
            <div>
              <a href={chars[selected].profile_url} target="_blank" class="rio-link">Raider.IO Profil</a>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

{#if showConfirm}
  <div class="confirm-overlay">
    <div class="confirm-popup">
      <p>Do you want to delete <b>{charToDelete?.name}</b> ?</p>
      <button on:click={deleteCharConfirmed}>Yes</button>
      <button on:click={cancelDelete}>Cancel</button>
    </div>
  </div>
{/if}

<style>
.main-layout {
  display: flex;
  align-items: flex-start;
  min-height: 600px;
}

.sidebar {
  min-width: 200px;
  max-width: 260px;
  background: #242525;
  border-radius: 10px;
  border: 1px solid #232323;
  margin-right: 32px;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.sidebar-item {
  display: flex;
  align-items: center;
  /* Das ist neu: */
  justify-content: space-between;
  gap: 12px;
  padding: 8px 16px;
  color: #e0e0e0;
  font-size: 1.09rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.14s;
}
.sidebar-item.selected, .sidebar-item:hover {
  background: #3d3d3f;
  color: #fff;
}
.icon-btn {
  background: none;
  border: none;
  padding: 2px 5px;
  cursor: pointer;
  vertical-align: middle;
  margin-left: 3px;
  opacity: 0.7;
  transition: opacity 0.15s, scale 0.12s;
}
.icon-btn:hover {
  opacity: 1;
  scale: 1.1;
}

.char-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #242525;
  padding: 38px 36px 36px 36px;
  border-radius: 12px;
  min-width: 420px;
  max-width: 760px;
  margin-left: 0;
  margin-right: 0;
}

.char-detail-container {
  display: flex;
  align-items: flex-start;
  gap: 32px;
}
.char-info {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-width: 340px;
  max-width: 500px;
  font-size: 1.14rem;
}
.char-name {
  font-size: 1.36rem;
  font-weight: 700;
  margin-bottom: 2px;
}
.class-race {
  font-size: 1.06rem;
  font-weight: 500;
  color: #e0e0e0;
}
.role {
  color: #38b6ff;
  font-size: 1.04rem;
  font-weight: 500;
}
.raid-prog-title {
  margin-top: 12px;
  font-size: 1.10rem;
  font-weight: 700;
  color: #fff;
}
.raid-list {
  list-style: none;
  padding: 0;
  margin: 3px 0 9px 0;
  width: 100%;
}
.raid-list li {
  font-size: 1.05rem;
  color: #eee;
  margin-bottom: 3px;
  text-align: left;
  padding-left: 4px;
}
.raid-detail {
  color: #aaf;
  font-size: 0.97rem;
  margin-left: 4px;
}
.mplus-score {
  margin-top: 10px;
  font-size: 1.18rem;
  font-weight: 700;
  color: #ffe066;
}
.rio-link {
  color: #3571a5;
  text-decoration: underline;
  margin-top: 8px;
  font-size: 1.11rem;
}
.confirm-overlay {
  position: fixed;
  z-index: 1000;
  left: 0; top: 0; right: 0; bottom: 0;
  background: #000a;
  display: flex;
  justify-content: center;
  align-items: center;
}
.confirm-popup {
  background: #1b1d22;
  color: #fff;
  padding: 32px 36px 24px 36px;
  border-radius: 14px;
  box-shadow: 0 4px 24px #0008;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}
.confirm-popup button {
  margin: 0 8px;
  padding: 7px 22px;
  font-size: 1.06rem;
  border-radius: 7px;
  border: none;
  background: #28354a;
  color: #fff;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.17s;
}
.confirm-popup button:first-child {
  background: #d9534f;
}
.confirm-popup button:hover {
  background: #1b293b;
}
</style>
