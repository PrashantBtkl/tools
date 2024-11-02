<script>
  import { onMount } from 'svelte';

  let jsonInput = '';
  let result = null;
  let errorLine = '';
  let errorColumn = 0;
  let textareaElement;
  let lineNumbersElement;

  function validateJSON() {
    if (jsonInput.trim() === '') {
      result = { valid: false, message: 'Please enter some JSON to validate.' };
      errorLine = '';
      errorColumn = 0;
      return;
    }

    try {
      JSON.parse(jsonInput);
      result = { valid: true, message: 'Valid JSON' };
      errorLine = '';
      errorColumn = 0;
    } catch (error) {
      const lines = jsonInput.split('\n');
      let lineNumber = 1;
      let charPosition = 0;

      const positionMatch = error.message.match(/line (\d+)/);
      const errorPosition = positionMatch ? parseInt(positionMatch[1], 10) : -1;

      if (errorPosition !== -1) {
        for (let i = 0; i < lines.length; i++) {
          if (charPosition + lines[i].length >= errorPosition) {
            lineNumber = i + 1;
            errorColumn = errorPosition - charPosition;
            errorLine = lines[errorPosition];
            break;
          }
          charPosition += lines[i].length + 1;
        }
      }

      result = {
        valid: false,
        message: `Invalid JSON: ${error.message}`,
        line: errorPosition
      };
    }
  }

  function updateLineNumbers() {
    if (textareaElement && lineNumbersElement) {
      const lines = jsonInput.split('\n');
      lineNumbersElement.innerHTML = lines.map((_, i) => i + 1).join('<br>');
    }
  }

  function handleInput() {
    updateLineNumbers();
  }

  function handleScroll() {
    if (textareaElement && lineNumbersElement) {
      lineNumbersElement.scrollTop = textareaElement.scrollTop;
    }
  }

  onMount(() => {
    updateLineNumbers();
  });
</script>

<div class="container">
  <h1>JSON Validator</h1>
  
  <label for="json-input">
    Paste your JSON here:
  </label>
  
  <div class="textarea-container">
    <div class="line-numbers" bind:this={lineNumbersElement}></div>
    <textarea
      id="json-input"
      bind:value={jsonInput}
      bind:this={textareaElement}
      on:input={handleInput}
      on:scroll={handleScroll}
      placeholder="Paste your JSON here..."
      aria-describedby="json-validation-result"
    ></textarea>
  </div>
  
  <button on:click={validateJSON}>
    Validate JSON
  </button>
  
  {#if result}
    <div
      id="json-validation-result"
      class="result {result.valid ? 'valid' : 'invalid'}"
      role="alert"
    >
      <p class="result-title">{result.valid ? 'Success' : 'Error'}</p>
      <p>{result.message}</p>
      {#if !result.valid && result.line}
        <p>Error on line: {result.line}</p>
        {#if errorLine}
          <pre class="error-highlight">{errorLine}
<span class="error-marker" style="left: {errorColumn - 1}ch;">^</span></pre>
        {/if}
      {/if}
    </div>
  {/if}
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

  label {
    display: block;
    margin-bottom: 10px;
    font-weight: bold;
  }

  .textarea-container {
    display: flex;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    height: 300px; /* Fixed height */
    overflow: hidden; /* Hide overflow */
  }

  .line-numbers {
    padding: 10px 5px;
    background-color: #f0f0f0;
    border-right: 1px solid #ccc;
    text-align: right;
    font-family: monospace;
    font-size: 14px;
    line-height: 1.5;
    color: #999;
    overflow-y: hidden;
    user-select: none;
  }

  textarea {
    flex-grow: 1;
    padding: 10px;
    border: none;
    font-family: monospace;
    font-size: 14px;
    line-height: 1.5;
    resize: none;
    overflow-y: scroll;
  }

  button {
    background-color: #4CAF50;
    border: none;
    color: white;
    padding: 10px 20px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin-bottom: 10px;
    cursor: pointer;
    border-radius: 4px;
  }

  button:hover {
    background-color: #45a049;
  }

  .result {
    padding: 10px;
    border-radius: 4px;
    margin-top: 10px;
  }

  .result.valid {
    background-color: #dff0d8;
    color: #3c763d;
  }

  .result.invalid {
    background-color: #f2dede;
    color: #a94442;
  }

  .result-title {
    font-weight: bold;
    margin-bottom: 5px;
  }

  .error-highlight {
    background-color: #ffeeee;
    padding: 5px;
    margin-top: 10px;
    position: relative;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: monospace;
  }

  .error-marker {
    position: absolute;
    color: red;
    font-weight: bold;
    top: 1.2em;
  }
</style>
