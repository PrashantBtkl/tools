<script>
  import { writable } from 'svelte/store';

  // Store for tables
  const tables = writable([]);

  // Store for indexes
  const indexes = writable([]);

  // Current table being edited
  let currentTable = { name: '', columns: [] };

  // Form data
  let newTableName = '';
  let newColumnName = '';
  let newColumnType = 'VARCHAR(255)';
  let newColumnConstraint = '';
  let newColumnDefault = '';
  let foreignKeyReference = { table: '', column: '' };
  let newIndexName = '';
  let newIndexColumns = [];

  // Edit mode
  let editMode = false;
  let editingTableIndex = -1;
  let editingColumnIndex = -1;

  // Column type options (expanded for PostgreSQL)
  const columnTypes = [
    'VARCHAR(255)', 'TEXT', 'INTEGER', 'BIGINT', 'FLOAT', 'DOUBLE PRECISION',
    'BOOLEAN', 'DATE', 'TIME', 'TIMESTAMP', 'SERIAL', 'BIGSERIAL', 'JSON', 'JSONB'
  ];

  // Constraint options
  const constraintTypes = ['', 'PRIMARY KEY', 'UNIQUE', 'NOT NULL', 'FOREIGN KEY'];

  // Function to start creating a new table
  function startNewTable() {
    currentTable = { name: newTableName, columns: [] };
    newTableName = '';
    editMode = false;
    editingTableIndex = -1;
  }

  // Function to start editing an existing table
  function editTable(table, index) {
    currentTable = JSON.parse(JSON.stringify(table)); // Deep copy
    editMode = true;
    editingTableIndex = index;
  }

  // Function to start editing a column
  function editColumn(columnIndex) {
    editingColumnIndex = columnIndex;
    const column = currentTable.columns[columnIndex];
    newColumnName = column.name;
    newColumnType = column.type;
    newColumnConstraint = column.constraint;
    newColumnDefault = column.default;
    if (column.constraint.startsWith('FOREIGN KEY')) {
      newColumnConstraint = 'FOREIGN KEY';
      const match = column.constraint.match(/REFERENCES (\w+)$$(\w+)$$/);
      if (match) {
        foreignKeyReference = { table: match[1], column: match[2] };
      }
    } else {
      foreignKeyReference = { table: '', column: '' };
    }
  }

  // Function to add or update a column
  function addOrUpdateColumn() {
    if (newColumnName && newColumnType) {
      let constraint = newColumnConstraint;
      if (constraint === 'FOREIGN KEY') {
        constraint = `FOREIGN KEY REFERENCES ${foreignKeyReference.table}(${foreignKeyReference.column})`;
      }
      const column = {
        name: newColumnName,
        type: newColumnType,
        constraint,
        default: newColumnDefault
      };
      if (editingColumnIndex === -1) {
        currentTable.columns = [...currentTable.columns, column];
      } else {
        currentTable.columns[editingColumnIndex] = column;
      }
      newColumnName = '';
      newColumnType = 'VARCHAR(255)';
      newColumnConstraint = '';
      newColumnDefault = '';
      foreignKeyReference = { table: '', column: '' };
      editingColumnIndex = -1;
    }
  }

  // Function to save the current table
  function saveTable() {
    if (currentTable.name && currentTable.columns.length > 0) {
      if (editMode) {
        tables.update(t => {
          t[editingTableIndex] = currentTable;
          return t;
        });
      } else {
        tables.update(t => [...t, currentTable]);
      }
      currentTable = { name: '', columns: [] };
      editMode = false;
      editingTableIndex = -1;
    }
  }

  // Function to add an index
  function addIndex() {
    if (newIndexName && newIndexColumns.length > 0) {
      indexes.update(i => [...i, { name: newIndexName, table: currentTable.name, columns: newIndexColumns }]);
      newIndexName = '';
      newIndexColumns = [];
    }
  }

  // Function to generate SQL for a table
  function generateSQL(table) {
    const columnDefinitions = table.columns.map(column => {
      let def = `  ${column.name} ${column.type}`;
      if (column.constraint) {
        if (column.constraint.startsWith('FOREIGN KEY')) {
          def += `,\n  ${column.constraint}`;
        } else {
          def += ` ${column.constraint}`;
        }
      }
      if (column.default) {
        def += ` DEFAULT ${column.default}`;
      }
      return def;
    }).join(',\n');

    let sql = `CREATE TABLE ${table.name} (\n${columnDefinitions}\n);\n\n`;

    // Add indexes
    $indexes
      .filter(index => index.table === table.name)
      .forEach(index => {
        sql += `CREATE INDEX ${index.name} ON ${table.name} (${index.columns.join(', ')});\n`;
      });

    return sql;
  }

  $: availableTables = $tables.map(t => t.name);
  $: availableColumns = foreignKeyReference.table
    ? $tables.find(t => t.name === foreignKeyReference.table)?.columns.map(c => c.name) || []
    : [];
</script>

<div class="container mx-auto p-4">
  <h1 class="text-2xl font-bold mb-4">PostgreSQL Database Modeller</h1>

  <!-- Create/Edit Table Form -->
  <div class="mb-4">
    <h2 class="text-xl font-semibold mb-2">{editMode ? 'Edit' : 'Create New'} Table</h2>
    <input
      type="text"
      bind:value={currentTable.name}
      placeholder="Table Name"
      class="border p-2 mr-2"
    />
    {#if !editMode}
      <button on:click={startNewTable} class="bg-blue-500 text-white p-2 rounded">
        Create Table
      </button>
    {/if}
  </div>

  <!-- Current Table Editor -->
  {#if currentTable.name}
    <div class="mb-4">
      <h2 class="text-xl font-semibold mb-2">Editing Table: {currentTable.name}</h2>
      <table class="w-full border-collapse border">
        <thead>
          <tr>
            <th class="border p-2">Column Name</th>
            <th class="border p-2">Type</th>
            <th class="border p-2">Constraint</th>
            <th class="border p-2">Default</th>
            <th class="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {#each currentTable.columns as column, i}
            <tr>
              {#if editingColumnIndex === i}
                <td class="border p-2">
                  <input
                    type="text"
                    bind:value={newColumnName}
                    placeholder="Column Name"
                    class="w-full"
                  />
                </td>
                <td class="border p-2">
                  <select bind:value={newColumnType} class="w-full">
                    {#each columnTypes as type}
                      <option value={type}>{type}</option>
                    {/each}
                  </select>
                </td>
                <td class="border p-2">
                  <select bind:value={newColumnConstraint} class="w-full">
                    {#each constraintTypes as constraint}
                      <option value={constraint}>{constraint || 'None'}</option>
                    {/each}
                  </select>
                  {#if newColumnConstraint === 'FOREIGN KEY'}
                    <div class="mt-2">
                      <select bind:value={foreignKeyReference.table} class="w-full mb-2">
                        <option value="">Select Referenced Table</option>
                        {#each availableTables as table}
                          <option value={table}>{table}</option>
                        {/each}
                      </select>
                      <select bind:value={foreignKeyReference.column} class="w-full">
                        <option value="">Select Referenced Column</option>
                        {#each availableColumns as column}
                          <option value={column}>{column}</option>
                        {/each}
                      </select>
                    </div>
                  {/if}
                </td>
                <td class="border p-2">
                  <input
                    type="text"
                    bind:value={newColumnDefault}
                    placeholder="Default Value"
                    class="w-full"
                  />
                </td>
                <td class="border p-2">
                  <button on:click={addOrUpdateColumn} class="bg-green-500 text-white p-2 rounded mr-2">
                    Update
                  </button>
                  <button on:click={() => editingColumnIndex = -1} class="bg-gray-500 text-white p-2 rounded">
                    Cancel
                  </button>
                </td>
              {:else}
                <td class="border p-2">{column.name}</td>
                <td class="border p-2">{column.type}</td>
                <td class="border p-2">{column.constraint}</td>
                <td class="border p-2">{column.default}</td>
                <td class="border p-2">
                  <button class="text-blue-500 mr-2" on:click={() => editColumn(i)}>
                    Edit
                  </button>
                  <button class="text-red-500" on:click={() => currentTable.columns = currentTable.columns.filter((_, index) => index !== i)}>
                    Remove
                  </button>
                </td>
              {/if}
            </tr>
          {/each}
          <tr>
            <td class="border p-2">
              <input
                type="text"
                bind:value={newColumnName}
                placeholder="Column Name"
                class="w-full"
              />
            </td>
            <td class="border p-2">
              <select bind:value={newColumnType} class="w-full">
                {#each columnTypes as type}
                  <option value={type}>{type}</option>
                {/each}
              </select>
            </td>
            <td class="border p-2">
              <select bind:value={newColumnConstraint} class="w-full">
                {#each constraintTypes as constraint}
                  <option value={constraint}>{constraint || 'None'}</option>
                {/each}
              </select>
              {#if newColumnConstraint === 'FOREIGN KEY'}
                <div class="mt-2">
                  <select bind:value={foreignKeyReference.table} class="w-full mb-2">
                    <option value="">Select Referenced Table</option>
                    {#each availableTables as table}
                      <option value={table}>{table}</option>
                    {/each}
                  </select>
                  <select bind:value={foreignKeyReference.column} class="w-full">
                    <option value="">Select Referenced Column</option>
                    {#each availableColumns as column}
                      <option value={column}>{column}</option>
                    {/each}
                  </select>
                </div>
              {/if}
            </td>
            <td class="border p-2">
              <input
                type="text"
                bind:value={newColumnDefault}
                placeholder="Default Value"
                class="w-full"
              />
            </td>
            <td class="border p-2">
              <button on:click={addOrUpdateColumn} class="bg-green-500 text-white p-2 rounded">
                Add Column
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <button on:click={saveTable} class="mt-4 bg-purple-500 text-white p-2 rounded">
        {editMode ? 'Update' : 'Save'} Table
      </button>

      <!-- Index Creation -->
      <div class="mt-4">
        <h3 class="text-lg font-semibold mb-2">Create Index</h3>
        <div class="flex items-start space-x-2">
          <input
            type="text"
            bind:value={newIndexName}
            placeholder="Index Name"
            class="border p-2 flex-grow"
          />
          <div class="flex-grow">
            <select multiple bind:value={newIndexColumns} class="border p-2 w-full h-24">
              {#each currentTable.columns as column}
                <option value={column.name}>{column.name}</option>
              {/each}
            </select>
            <p class="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple columns</p>
          </div>
          <button on:click={addIndex} class="bg-yellow-500 text-white p-2 rounded">
            Add Index
          </button>
        </div>
      </div>

      <!-- Existing Indexes -->
      <div class="mt-4">
        <h3 class="text-lg font-semibold mb-2">Existing Indexes</h3>
        <ul class="list-disc list-inside">
          {#each $indexes.filter(index => index.table === currentTable.name) as index}
            <li>{index.name} ({index.columns.join(', ')})</li>
          {/each}
        </ul>
      </div>
    </div>
  {/if}

  <!-- Table List -->
  <div class="mb-4">
    <h2 class="text-xl font-semibold mb-2">Created Tables</h2>
    {#each $tables as table, index}
      <div class="border p-4 mb-4">
        <h3 class="font-bold text-lg mb-2">
          {table.name}
          <button on:click={() => editTable(table, index)} class="ml-2 bg-blue-500 text-white p-1 rounded text-sm">
            Edit
          </button>
        </h3>
        <table class="w-full border-collapse border mb-2">
          <thead>
            <tr>
              <th class="border p-2">Column Name</th>
              <th class="border p-2">Type</th>
              <th class="border p-2">Constraint</th>
              <th class="border p-2">Default</th>
            </tr>
          </thead>
          <tbody>
            {#each table.columns as column}
              <tr>
                <td class="border p-2">{column.name}</td>
                <td class="border p-2">{column.type}</td>
                <td class="border p-2">{column.constraint}</td>
                <td class="border p-2">{column.default}</td>
              </tr>
            {/each}
          </tbody>
        </table>
        <h4 class="font-semibold mb-2">Indexes:</h4>
        <ul class="list-disc list-inside mb-2">
          {#each $indexes.filter(index => index.table === table.name) as index}
            <li>{index.name} ({index.columns.join(', ')})</li>
          {/each}
        </ul>
        <h4 class="font-semibold mb-2">SQL:</h4>
        <pre class="bg-gray-100 p-2 rounded">{generateSQL(table)}</pre>
      </div>
    {/each}
  </div>
</div>

<style>
  /* You can add any additional styles here */
</style>
