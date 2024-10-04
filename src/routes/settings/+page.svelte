<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import addIcon from '../../lib/images/icons/add.svg?raw';
	import deleteIcon from '../../lib/images/icons/delete.svg?raw';

	let directories = [];
	let submitError;

	async function getDirectories() {
		let resp = await fetch('/api/settings');
		let respData = await resp.json();

		// console.log(respData);

		directories = respData.hits || [];
	}

	async function deleteDir(id) {
		// console.log({ id });
		alert('Delete not yet fully implemented...');
	}

	async function handleAddDirectory(event) {
		submitError = null;

		const formEl = event.target as HTMLFormElement;
		const data = new FormData(formEl);

		const response = await fetch(formEl.action, {
			method: 'POST',
			body: data
		});

		const responseData = await response.json();

		if (response.status !== 200) {
			submitError = responseData.message;
		} else {
			await getDirectories();
		}
	}

	async function indexFiles() {
		let resp = await fetch('/api/index');
		let respData = await resp.json();

		// console.log(respData);
	}

	onMount(() => {
		getDirectories();
	});

	$: console.log(JSON.stringify(submitError, 0, 4));
</script>

<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>

<div class="text-column">
	<!-- <p>Coming Soon</p> -->

	<div id="directories">
		<h1>Directories</h1>

		<div class="border">
			{#each directories as { document }}
				<div>
					<span>{document.directory} &nbsp;</span>
					<div>
						<button on:click={deleteDir(document.id)}>
							{@html deleteIcon}
						</button>
					</div>
				</div>
			{/each}
		</div>

		<br />

		<h4>Add New</h4>
		<form method="POST" action="/api/directory" on:submit|preventDefault={handleAddDirectory}>
			<div class="field">
				<input type="text" name="directory" required />
				<button title="Add Directory">
					{@html addIcon}
				</button>
			</div>

			{#if submitError}
				<div class="error">
					{submitError}
				</div>
			{/if}
		</form>
	</div>

	<br />
	<div class="border field">
		<h4>Click 👉 to start indexing....</h4>

		<button title="Index Files" on:click={indexFiles} disabled={directories.length === 0}>
			Index Files
		</button>
	</div>
</div>

<style lang="scss">
	h1 {
		margin: 5px 0;
	}
	.text-column {
		text-align: center;
	}

	.border {
		border: 1px solid #ccc;
		padding: 10px;
		border-radius: 10px;
		justify-content: space-between;
		background: #fafafa;

		div {
			display: flex;
			margin: 10px 0;
			gap: 0.25em;
			padding: 10px 0;
			border-bottom: 1px solid #ddd;
		}
	}
	#directories {
		text-align: left;
		border: 1px solid #ccc;
		padding: 1em;
		border-radius: 10px;
	}

	.error {
		color: #d66;
	}
</style>
