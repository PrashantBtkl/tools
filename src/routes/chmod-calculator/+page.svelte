<script>
  let owner = { read: false, write: false, execute: false };
  let group = { read: false, write: false, execute: false };
  let others = { read: false, write: false, execute: false };
  let chmodInput = '';
  let linuxPermInput = '';

  $: ownerValue = calculateValue(owner);
  $: groupValue = calculateValue(group);
  $: othersValue = calculateValue(others);
  $: chmodValue = `${ownerValue}${groupValue}${othersValue}`;
  $: linuxPermissions = calculateLinuxPermissions(owner, group, others);

  function calculateValue(permissions) {
    let value = 0;
    if (permissions.read) value += 4;
    if (permissions.write) value += 2;
    if (permissions.execute) value += 1;
    return value;
  }

  function calculateLinuxPermissions(owner, group, others) {
    const getPermString = (perm) => {
      return `${perm.read ? 'r' : '-'}${perm.write ? 'w' : '-'}${perm.execute ? 'x' : '-'}`;
    };
    return getPermString(owner) + getPermString(group) + getPermString(others);
  }

  function updateFromChmodValue() {
    if (/^[0-7]{3}$/.test(chmodValue)) {
      [owner, group, others] = chmodValue.split('').map(updatePermissionsFromOctal);
    }
  }

  function updateFromLinuxPermissions() {
    if (/^[rwx-]{9}$/.test(linuxPermissions)) {
      [owner, group, others] = [
        linuxPermissions.slice(0, 3),
        linuxPermissions.slice(3, 6),
        linuxPermissions.slice(6, 9)
      ].map(updatePermissionsFromString);
    }
  }

  function updatePermissionsFromOctal(value) {
    const num = parseInt(value, 8);
    return {
      read: !!(num & 4),
      write: !!(num & 2),
      execute: !!(num & 1)
    };
  }

  function updatePermissionsFromString(str) {
    return {
      read: str[0] === 'r',
      write: str[1] === 'w',
      execute: str[2] === 'x'
    };
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
    <strong>Chmod Value:</strong> <input type="text" bind:value={chmodValue} oninput={updateFromChmodValue} maxlength="3" placeholder="e.g. 755" />
  </div>
  
  <div class="result">
    <strong>Linux Permissions:</strong> <input type="text" bind:value={linuxPermissions} oninput={updateFromLinuxPermissions} maxlength="9" placeholder="e.g. rwxr-xr-x" />
  </div>
  
  <div class="result">
    <strong>Chmod Command:</strong> <code>sudo chmod {chmodValue} [filename]</code>
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
