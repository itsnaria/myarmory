<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let region: string = 'eu';
  export let value: string = '';

  let realms: string[] = [];
  let search = '';
  let showList = false;

  // Realms beim Mount laden

  onMount(() => {
    loadRealms(region);
    search = value;
  });

    // Realms neu laden, wenn Region sich ändert (aber nur im Browser!)
  $: if (typeof window !== 'undefined' && region) {
    loadRealms(region);
    search = value;
  }


  // Funktion zum Laden der Realms basierend auf der Region
  // Lädt die Realms von einer JSON-Datei, die die Serverdaten enthält
  async function loadRealms(region: string) {
    let list = [];
    if (region === 'eu') {
      const data = await fetch('/data/servers.eu.json').then(r => r.json());
      list = data.realms.map(r => r.name);
    } else {
      const data = await fetch('/data/servers.us.json').then(r => r.json());
      list = data.realms.map(r => r.name);
    }
    realms = list;
  }

  // Einfache Filterfunktion
  // Filtert die Realms basierend auf der Suchanfrage
  // Wenn keine Suchanfrage vorhanden ist, werden alle Realms angezeigt
  $: filtered = search
    ? realms.filter(r => r.toLowerCase().includes(search.toLowerCase()))
    : realms;

  function selectRealm(realm: string) {
    value = realm;
    search = realm;
    showList = false;
    dispatch('select', value);
  }
</script>

<div style="position: relative; width: 100%;">
  <input
    class="form-input"
    id="realm-select"
    type="text"
    bind:value={search}
    on:focus={() => showList = true}
    on:input={() => showList = true}
    on:blur={() => setTimeout(() => showList = false, 120)}
    placeholder="Enter a realm..."
    autocomplete="off"
    aria-autocomplete="list"
    style="position: relative; background: #181818; z-index: 2;"
  />

  {#if showList && filtered.length}
    <div class="dropdown-list">
      {#each filtered as realm}
        <div
          class="dropdown-item"
          role="option"
          tabindex="0"
          aria-selected={value === realm}
          on:mousedown={() => selectRealm(realm)}
        >{realm}</div>
      {/each}
    </div>
  {/if}
</div>

<style>
.autocomplete-ghost-input {
  color: #555 !important;
  background: none !important;
  border-color: transparent !important;
  pointer-events: none;
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  z-index: 1;
}
.dropdown-list {
  position: absolute;
  top: 110%;
  left: 0;
  right: 0;
  background: #232323;
  border: 1px solid #444;
  max-height: 280px;
  overflow-y: auto;
  border-radius: 0 0 6px 6px;
  z-index: 50;
  box-shadow: 0 6px 18px 0 #000c;
}
.dropdown-region {
  color: #888;
  font-size: 1rem;
  font-weight: 600;
  padding: 6px 16px 2px 16px;
  background: #232323;
}
.dropdown-item {
  padding: 8px 16px;
  cursor: pointer;
  color: #fff;
  font-size: 1.08rem;
  background: #232323;
}
.dropdown-item:hover, .dropdown-item:focus {
  background: #333;
  color: #fff;
}
input.form-input {
  padding: 13px 14px;
  border-radius: 6px;
  font-size: 1.1rem;
  box-sizing: border-box;
  width: 100%;
  position: relative;
  background: #181818;
  z-index: 3;
}
</style>
