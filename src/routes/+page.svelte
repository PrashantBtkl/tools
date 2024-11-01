<script>
  import { Database, Lock } from 'lucide-svelte';

  const tools = [
    { name: 'Database Modeller', href: '/database-modeller', icon: Database },
    { name: 'Chmod Calculator', href: '/chmod-calculator', icon: Lock },
  ];
</script>

<main>
  <header>
    <h1>DevTools Hub</h1>
    <p>Your one-stop shop for essential development tools</p>
  </header>

  <div class="tools-grid">
    {#each tools as tool}
      <a href={tool.href} class="tool-card">
        <svelte:component this={tool.icon} size={24} />
        <span>{tool.name}</span>
      </a>
    {/each}
  </div>
</main>

<style>
  :global(body) {
    font-family: Arial, sans-serif;
    background-color: #f0f4f8;
    margin: 0;
    padding: 0;
  }

  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  header {
    text-align: center;
    margin-bottom: 2rem;
  }

  h1 {
    color: #2c3e50;
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: #7f8c8d;
    font-size: 1.1rem;
  }

  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .tool-card {
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
    text-decoration: none;
    color: #34495e;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .tool-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }

  .tool-card span {
    font-weight: bold;
  }
</style>
