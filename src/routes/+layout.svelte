<script>
  import { goto } from '$app/navigation';
  import { selectedChar } from '$lib/stores/selectedChar'; // Beispiel-Store

</script>

<nav class="headbar">
  <a href="/" class="logo-link">
    <img src="/images/MyArmoryLogo.png" alt="MyArmory Logo" class="logo" />
  </a>

  <div class="headbar-nav">
    <a href="/overview" class="nav-link">Overview</a>
    {#if $selectedChar && $selectedChar.guild && $selectedChar.region && $selectedChar.realm}
  <a href={`/guild?region=${$selectedChar.region}&realm=${encodeURIComponent($selectedChar.realm)}&name=${encodeURIComponent($selectedChar.guild)}`} class="nav-link">
    { $selectedChar.guild }
  </a>
{:else}
  <span class="nav-link disabled">Guild</span>
{/if}

    <!-- Weitere Navlinks hier -->
  </div>
</nav>
<slot />

<style>
.headbar {
  display: flex;
  align-items: center;
  height: 72px;
  background: #000000;
  box-shadow: 0 4px 14px #0006;
  padding: 0 26px 0 12px;
  /* Logo bleibt ganz links */
}

.logo-link {
  display: flex;
  align-items: center;
}

.logo {
  height: 55px;
  margin-right: 12px;
}

.headbar-nav {
  display: flex;
  align-items: center;
  margin-left: 25px; /* <- Breite deiner Sidebar! */
  gap: 28px;
}

.nav-link {
  color: #ffffff;
  font-size: 1.36rem;
  font-weight: 500;
  margin-right: 10px;
  text-decoration: none;
  padding: 5px 16px;
  border-radius: 8px;
  transition: background 0.16s;
}
.nav-link:hover {
  background: #222c;
  color: #fff;
}


</style>
