<script lang="ts">
  import { onMount } from 'svelte';
  import type { Website, SitemapPage, Metrics } from '$lib/types';
  
  export let website: Website;
  
  let metrics: Metrics = {
    totalPages: 0,
    newPages: 0,
    removedPages: 0,
    monthlyGrowth: 0
  };
  
  function calculateMetrics() {
    const storageKey = `sitemap_${website.name.toLowerCase().replace(/\s+/g, '_')}`;
    const lastVisit = localStorage.getItem(`${storageKey}_last_visit`);
    const currentData: SitemapPage[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    if (!lastVisit) return;
    
    const lastVisitDate = new Date(lastVisit);
    const lastData: SitemapPage[] = JSON.parse(localStorage.getItem(`${storageKey}_previous`) || '[]');
    
    // Calculate new and removed pages since last visit
    const newPages = currentData.filter(page => 
      !lastData.some(lastPage => lastPage.loc === page.loc)
    );
    
    const removedPages = lastData.filter(lastPage =>
      !currentData.some(page => page.loc === lastPage.loc)
    );
    
    // Calculate monthly growth
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyPages = currentData.filter(page => {
      if (!page.lastmod) return false;
      const pageDate = new Date(page.lastmod);
      return pageDate.getMonth() === currentMonth && 
             pageDate.getFullYear() === currentYear;
    });
    
    metrics = {
      totalPages: currentData.length,
      newPages: newPages.length,
      removedPages: removedPages.length,
      monthlyGrowth: monthlyPages.length
    };
  }
  
  onMount(() => {
    calculateMetrics();
  });
</script>

<div class="metrics">
  <div class="metric-card">
    <h3>Total Pages</h3>
    <div class="value">{metrics.totalPages}</div>
  </div>
  
  <div class="metric-card">
    <h3>New Pages (Since Last Visit)</h3>
    <div class="value positive">+{metrics.newPages}</div>
  </div>
  
  <div class="metric-card">
    <h3>Removed Pages (Since Last Visit)</h3>
    <div class="value negative">-{metrics.removedPages}</div>
  </div>
  
  <div class="metric-card">
    <h3>Pages Added This Month</h3>
    <div class="value positive">+{metrics.monthlyGrowth}</div>
  </div>
</div>

<style>
  .metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .metric-card {
    background: white;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    color: #6c757d;
  }

  .value {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
  }

  .positive {
    color: #28a745;
  }

  .negative {
    color: #dc3545;
  }
</style> 