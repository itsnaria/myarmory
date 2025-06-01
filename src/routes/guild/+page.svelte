<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  let guildData: any = null;
  let loading = true;
  let region: string | null = null;
  let realm: string | null = null;
  let name: string | null = null;

  // Extract parameters from the URL
  $: region = $page.url.searchParams.get('region');
  $: realm = $page.url.searchParams.get('realm');
  $: name = $page.url.searchParams.get('name');

  // Fetch guild data when the component mounts
  // and the parameters are available
  onMount(async () => {
    if (region && realm && name) {
      const res = await fetch(`/api/guild/${region}/${realm}/${name}`);
      if (res.ok) {
        guildData = await res.json();
      } else {
        guildData = null;
      }
    }
    loading = false;
  });

  // Format Raid Name
  function prettyRaidName(slug: string) {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
</script>

{#if loading}
  <p>Lade Gildeninformationen ...</p>
{:else if guildData}
  <div class="guild-details">
    <h2>{guildData.name}</h2>
    <p><b>Realm:</b> {guildData.realm}</p>
    <p>
      <a href={guildData.profile_url} target="_blank" rel="noopener">
        Raider.IO Profil
      </a>
    </p>

    <h3>Raids</h3>
<ul class="raid-combined-list">
  {#each Object.entries(guildData.raid_progression ?? {}) as [raid, prog]}
    {#if guildData.raid_rankings && guildData.raid_rankings[raid]}
      <li>
        <div class="raid-name"><b>{prettyRaidName(raid)}:</b></div>
        <div class="raid-combined-details">
          <span class="rank-label">World Rank:</span>
          <span class="rank-value">{guildData.raid_rankings[raid]?.mythic?.world ?? '-'}</span>
          <span class="m-progress">{prog.mythic_bosses_killed ?? 0}/{prog.total_bosses ?? 0} M</span>
        </div>
      </li>
    {/if}
  {/each}
</ul>

  </div>
{:else}
  <p>Gilde nicht gefunden.</p>
{/if}

<style>
.guild-details {
  background: #242525;
  padding: 38px 36px 36px 36px;
  border-radius: 12px;
  min-width: 420px;
  max-width: 760px;
  margin: 32px 0 0 235px;
  box-shadow: 0 2px 16px rgba(29, 28, 28, 0.467);
  color: #fff;
  font-size: 1.13rem;
}
.guild-details h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 10px;
}
.guild-details h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-top: 28px;
  margin-bottom: 12px;
}
.guild-details p,
.guild-details a {
  margin-bottom: 5px;
}
.raid-combined-list {
  list-style: none;
  padding: 0 0 0 14px;
  margin: 0;
}
.raid-combined-list li {
  margin-bottom: 18px;
}
.raid-name {
  font-size: 1.11rem;
  font-weight: 600;
  margin-bottom: 3px;
}
.raid-combined-details {
  margin-left: 24px;
  display: flex;
  flex-direction: row;
  gap: 18px;
  align-items: baseline;
}
.rank-label {
  color: #b9d5ff;
  font-weight: 500;
  font-size: 1.02rem;
}
.m-progress {
  color: #ffe066;
  font-size: 1.07rem;
  font-weight: 600;
  margin-left: 12px;
}
.raid-combined-details {
  margin-left: 24px;
  display: flex;
  flex-direction: row;
  gap: 18px;
  align-items: baseline;
}

.rank-label {
  color: #b9d5ff;
  font-weight: 500;
  font-size: 1.02rem;
  min-width: 105px;
  display: inline-block;
  text-align: left;
}

.rank-value {
  min-width: 46px;
  display: inline-block;
  text-align: right;
  font-size: 1.08rem;
  font-weight: 500;
}

.m-progress {
  color: #ffe066;
  font-size: 1.07rem;
  font-weight: 600;
  margin-left: 12px;
  min-width: 70px;
  display: inline-block;
  text-align: left;
}

</style>
