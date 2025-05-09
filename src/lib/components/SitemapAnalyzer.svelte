<script lang="ts">
  import { onMount } from 'svelte';
  import type { Website, SitemapPage } from '$lib/types';
  
  export let website: Website;
  
  let loading = false;
  let error: string | null = null;
  let sitemapData: SitemapPage[] = [];
  let directoryStats = new Map<string, number>();
  
  async function fetchSitemap() {
    loading = true;
    error = null;
    
    try {
      const response = await fetch(website.url);
      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "text/xml");
      
      const urls = Array.from(xmlDoc.getElementsByTagName("url"));
      sitemapData = urls.map(url => ({
        loc: url.getElementsByTagName("loc")[0]?.textContent || '',
        lastmod: url.getElementsByTagName("lastmod")[0]?.textContent || undefined
      }));
      
      // Calculate directory statistics
      const dirStats = new Map<string, number>();
      sitemapData.forEach(({ loc }) => {
        if (loc) {
          const url = new URL(loc);
          const pathParts = url.pathname.split('/').filter(Boolean);

          let currentPath = '';
          // Only count up to the second-to-last part (folders only)
          for (let i = 0; i < pathParts.length - 1; i++) {
            currentPath += '/' + pathParts[i];
            dirStats.set(currentPath, (dirStats.get(currentPath) || 0) + 1);
          }
        }
      });
      
      directoryStats = dirStats;
      
      // Store in localStorage
      const storageKey = `sitemap_${website.name.toLowerCase().replace(/\s+/g, '_')}`;
      const lastVisit = localStorage.getItem(`${storageKey}_last_visit`);
      const lastData = lastVisit ? JSON.parse(localStorage.getItem(storageKey) || '[]') : null;
      
      localStorage.setItem(storageKey, JSON.stringify(sitemapData));
      localStorage.setItem(`${storageKey}_last_visit`, new Date().toISOString());
      
      // Calculate growth metrics
      if (lastData) {
        const newPages = sitemapData.filter(page => 
          !lastData.some((lastPage: SitemapPage) => lastPage.loc === page.loc)
        );
        const removedPages = lastData.filter((lastPage: SitemapPage) =>
          !sitemapData.some(page => page.loc === lastPage.loc)
        );
        
        return {
          totalPages: sitemapData.length,
          newPages: newPages.length,
          removedPages: removedPages.length,
          directoryStats: Object.fromEntries(directoryStats)
        };
      }
      
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error occurred';
    } finally {
      loading = false;
    }
  }
  
  onMount(() => {
    fetchSitemap();
  });
</script>

<div class="sitemap-analyzer">
  {#if loading}
    <div class="loading">Loading sitemap data...</div>
  {:else if error}
    <div class="error">Error: {error}</div>
  {:else if sitemapData.length > 0}
    <div class="stats">
      <h3>Directory Statistics</h3>
      <div class="directory-list">
        {#each Array.from(directoryStats.entries()) as [path, count]}
          <div class="directory-item">
            <span class="path">{path}</span>
            <span class="count">{count} pages</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .sitemap-analyzer {
    margin-top: 1rem;
  }

  .loading, .error {
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .loading {
    background: #f8f9fa;
    color: #6c757d;
  }

  .error {
    background: #fee;
    color: #dc3545;
  }

  .stats {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 4px;
  }

  h3 {
    margin: 0 0 1rem 0;
    color: #495057;
  }

  .directory-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .directory-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    border-bottom: 1px solid #dee2e6;
  }

  .directory-item:last-child {
    border-bottom: none;
  }

  .path {
    color: #495057;
    font-family: monospace;
  }

  .count {
    color: #6c757d;
    font-weight: 500;
  }
</style> 
