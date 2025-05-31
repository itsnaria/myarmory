<script lang="ts">
  import ImportForm from '$lib/components/ImportForm.svelte';
</script>

<div class="background">
  <div class="center-box">
    <ImportForm />
  </div>
</div>

<style>
.background {
  min-height: 100vh;
  min-width: 100vw;
  background: #141414;
  display: flex;
  justify-content: center;
  align-items: center;
}
.center-box {
  background: #222;
  border-radius: 16px;
  padding: 48px 64px 36px 64px;
  box-shadow: 0 12px 40px 0 #000c;
  min-width: 440px;
  max-width: 700px;
}
</style>
