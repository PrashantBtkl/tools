<script>
//  import { JSONEditor } from 'svelte-jsoneditor'
//
//  let content = {
//    text: undefined, // can be used to pass a stringified JSON document instead
//    json: {
//      array: [1, 2, 3],
//      boolean: true,
//      color: '#82b92c',
//      null: null,
//      number: 123,
//      object: { a: 'b', c: 'd' },
//      string: 'Hello World'
//    }
//  }

</script>

<svelte:head>
<meta name="description" content="json formatter and validator online">
<title>json formatter and validator</title>
</svelte:head>

<h1>Json formatter and validator</h1>
<div class=editor>
</div>



<style>
h1 {
    font-family: arial;
    font-weight: 400;
    text-align: center;
}

.editor {
		border-color: red;
		padding-top: 50px;
		max-width: 80%;
		max-height: 70%;
		margin-inline: auto;
}
</style>
