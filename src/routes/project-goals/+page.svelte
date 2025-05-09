<script lang="ts">
  import SitemapAnalyzer from '$lib/components/SitemapAnalyzer.svelte';
  import PageMetrics from '$lib/components/PageMetrics.svelte';

  const websites = [
    { name: 'Invite Island', url: 'https://inviteisland.in/sitemap.xml' },
    { name: 'Info Jungle', url: 'https://infojungle.org/sitemap.xml' }
  ];
</script>

<div class="container">
  <h1>Website Growth Metrics</h1>
  
  <div class="metrics-container">
    {#each websites as website}
      <div class="website-card">
        <h2>{website.name}</h2>
        <SitemapAnalyzer {website} />
        <PageMetrics {website} />
      </div>
    {/each}
  </div>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  h1 {
    color: #2c3e50;
    margin-bottom: 2rem;
    text-align: center;
  }

  .metrics-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 2rem;
  }

  .website-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  h2 {
    color: #34495e;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid #eee;
    padding-bottom: 0.5rem;
  }
</style> 
