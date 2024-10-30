<script>
  let owner = { read: false, write: false, execute: false };
  let group = { read: false, write: false, execute: false };
  let others = { read: false, write: false, execute: false };

  $: ownerValue = calculateValue(owner);
  $: groupValue = calculateValue(group);
  $: othersValue = calculateValue(others);
  $: chmodValue = `${ownerValue}${groupValue}${othersValue}`;

  function calculateValue(permissions) {
    let value = 0;
    if (permissions.read) value += 4;
    if (permissions.write) value += 2;
    if (permissions.execute) value += 1;
    return value;
  }
</script>

<div class="container">
  <h1>Chmod Calculator</h1>
  
  <div class="grid">
    <div></div>
    <div class="header">Owner</div>
    <div class="header">Group</div>
    <div class="header">Others</div>
    
    <div class="header">Read</div>
    <input type="checkbox" bind:checked={owner.read} />
    <input type="checkbox" bind:checked={group.read} />
    <input type="checkbox" bind:checked={others.read} />
    
    <div class="header">Write</div>
    <input type="checkbox" bind:checked={owner.write} />
    <input type="checkbox" bind:checked={group.write} />
    <input type="checkbox" bind:checked={others.write} />
    
    <div class="header">Execute</div>
    <input type="checkbox" bind:checked={owner.execute} />
    <input type="checkbox" bind:checked={group.execute} />
    <input type="checkbox" bind:checked={others.execute} />
  </div>
  
  <div class="result">
    <strong>Chmod Value:</strong> {chmodValue}
  </div>
  
  <div class="result">
    <strong>Chmod Command:</strong> chmod {chmodValue} [filename]
  </div>
</div>

<style>
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
  }

  h1 {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }

  .header {
    font-weight: bold;
  }

  input[type="checkbox"] {
    justify-self: center;
  }

  .result {
    margin-bottom: 10px;
  }

  strong {
    margin-right: 5px;
  }
</style>
