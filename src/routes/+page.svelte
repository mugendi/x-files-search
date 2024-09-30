<script lang="ts">
	import { formatDate, formatNumber, highlightMatch, isLocalhost } from '$lib/utils';
	import { fade } from 'svelte/transition';
	import dirIcon from '$lib/images/icons/dir.svg?raw';
	import fileIcon from '$lib/images/icons/file.svg?raw';
	import codeIcon from '$lib/images/icons/code.svg?raw';
	import sortIcon from '$lib/images/icons/sort.svg';
	import loadingSVG from '$lib/images/loading.svg?raw';
	import findIcon from '$lib/images/icons/find.svg?raw';
	import findImg from '$lib/images/icons/find.svg';
	import logoImg from '$lib/images/logo-w-text.png';
	import { onMount } from 'svelte';
	import Pagination from '../components/Pagination.svelte';
	import Popup from '../components/Popup.svelte';
	import bytes from 'bytes';
	import Facets from '../components/Facets.svelte';

	// let timeoutInt: number;
	let searchResults: object = {};
	let statsResults: object = {};
	let selectedLang: string | null = null;
	let query: string | null = null;
	let searchEl: HTMLInputElement;
	let isBusy: boolean = false;
	let isReady: boolean = false;
	let sortOrder = 'modified:desc';
	let currentPage = 1;
	let itemsPerPage = 20;
	let isLocal = true;

	let preview: object = {};

	let fetchingSource: string | null = null;
	let searchQuery = '';

	async function search(val: string) {
		if (val.length > 2) {
			query = val;
		}
	}

	async function searchFiles(queryObj: object) {
		// console.log(query, selectedLang);

		let queryArr = [];
		let val: string;

		for (let k in queryObj) {
			val = String(queryObj[k] || '');
			if (val.length > 0) {
				queryArr.push(`${k}=${encodeURIComponent(queryObj[k])}`);
			}
		}

		if ((queryObj.q && queryArr.length) || selectedLang || searchResults.hits) {
			let url = '/api/directory?' + queryArr.join('&');
			console.log('URL', url);
			// searchResults = {};
			isBusy = true;
			let resp = await fetch(url);
			searchResults = await resp.json();
			isBusy = false;
			console.log(searchResults);
		}
	}

	async function open(action: string, doc: object) {
		let path = doc.file;

		isBusy = true;

		if (action == 'view-source') {
			fetchingSource = path;
		}

		// let language = doc.language;
		preview.source = null;
		preview.size = null;

		let url = '/api/open?action=' + action + '&path=' + path;
		let resp = await fetch(url);
		let respData = await resp.json();

		isBusy = false;

		// show source
		if (respData.source) {
			preview.size = respData.previewSize || respData.fileSize;
			preview.file = doc.file;
			preview.fileSize = respData.fileSize;
			preview.language = doc.language == 'Unknown' ? null : doc.language;
			preview.source = respData.source;
		}

		if (action == 'view-source') {
			fetchingSource = null;
		}
	}

	async function getStats() {
		// statsResults
		let url = '/api/stats?';
		// console.log('URL', url);
		// searchResults = {};
		// isBusy = true;
		let resp = await fetch(url);
		statsResults = await resp.json();
	}

	onMount(() => {
		isReady = true;
		isLocal = isLocalhost(window.location.hostname);
		getStats();
	});

	$: if (isReady) {
		let queryObj = {
			q: query,
			lang: selectedLang,
			sort: sortOrder,
			limit: itemsPerPage,
			page: currentPage
		};

		// console.log({ queryObj });
		searchFiles(queryObj);
	}

	// $: console.log({ preview.source, preview.size, preview.fileSize });
	// $: console.log(statsResults);
</script>

<svelte:head>
	<title>X-Files-Search</title>
	<meta name="description" content="The amazing indexer for files on your system!" />

	<!-- Highligh JS -->
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/default.min.css"
	/>
	<script
		src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js"
	></script>

	<!-- and it's easy to individually load additional languages -->
	<script
		src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/languages/go.min.js"
	></script>
</svelte:head>

<div class="text-column" class:wide={searchResults.hits}>
	<!-- <h1>Search Your Files</h1> -->

	{#if !searchResults.hits}
		<div class="page-logo" transition:fade={{ delay: 250, duration: 300 }}>
			<img src={logoImg} alt="" />
		</div>
	{/if}
	<form on:submit|preventDefault={() => search(searchEl.value)}>
		<div class="field">
			<div class="input">
				<input
					type="text"
					placeholder={isReady ? 'Search local files' : 'Initializing...'}
					bind:this={searchEl}
					disabled={!isReady || isBusy}
					bind:value={searchQuery}
				/>

				{#if isBusy || !isReady}
					<span class="loading" transition:fade={{ delay: 0, duration: 200 }}>
						{@html loadingSVG}
					</span>
				{/if}
			</div>

			<button disabled={!searchQuery || !isReady || isBusy}>
				{@html findIcon}
			</button>
		</div>
	</form>

	{#if !statsResults.facets && !searchResults.hits}
		<Facets results={statsResults} asStats={true} bind:selectedLang />
	{/if}

	{#if searchResults.hits && searchResults.hits.length}
		<Pagination totalItems={searchResults.found} {itemsPerPage} bind:currentPage></Pagination>

		<div class="results" transition:fade={{ delay: 250, duration: 300 }}>
			<div class="found">
				<div class="results-stats">
					<h4>
						{formatNumber(searchResults.found)} Total Results Found / {formatNumber(
							searchResults.out_of
						)} indexed.
					</h4>

					<div class="sort small">
						<div class="flex-mid">
							<img src={sortIcon} alt="sort icon" height="18px" />
							<span>SORT BY</span>
						</div>
						<select bind:value={sortOrder}>
							<option value="modified:desc">Newest First</option>
							<option value="modified:asc">Oldest First</option>
							<option value="size:asc">Smallest First</option>
							<option value="size:desc">Largest First</option>
						</select>
					</div>
				</div>

				<Facets results={searchResults} bind:selectedLang />
			</div>

			<div class="hits small">
				{#each searchResults.hits as { document, highlight }, i (i)}
					<div class="hit">
						<div class="file">
							<span class="file-path">
								<div>
									<strong>File:</strong>
									{#if highlight.source?.snippet}
										{document.file}
									{:else}
										{@html highlightMatch(document.file, query)}
									{/if}
								</div>

								<div>
									<strong>Size:</strong>
									{bytes(document.size)} |
									<strong>Language:</strong>
									{document.language} |
									<strong>Modified:</strong>
									{formatDate(document.modified * 1000)}
								</div>

								{#if fetchingSource == document.file}
									<p transition:fade={{ delay: 0, duration: 200 }}>
										{@html loadingSVG} Fetching...
									</p>
								{/if}
							</span>

							<div>
								<button
									class="small"
									on:click={() => open('view-source', document)}
									title="View Source"
									disabled={isBusy}
								>
									{@html codeIcon}
								</button>
								{#if isLocal}
									<button
										class="small"
										on:click={() => open('open-dir', document)}
										title="Open Containing Directory"
										disabled={isBusy}
									>
										{@html dirIcon}
									</button>
									<button
										class="small"
										on:click={() => open('open-file', document)}
										title="Open File"
										disabled={isBusy}
									>
										{@html fileIcon}
									</button>
								{/if}
							</div>
						</div>

						{#if highlight.source?.snippet}
							<pre>{@html highlight.source?.snippet || ''}</pre>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<Pagination totalItems={searchResults.found} {itemsPerPage} bind:currentPage></Pagination>
	{:else if searchResults.found === 0}
		<div class="flex-mid" style:margin="1em 0">
			<img src={findImg} height="100px" alt="no data" />
			<div>
				<h4>No files match that query and/or filters</h4>
				<p>We couldn't find a ting!! Please search more broadly!</p>
			</div>
		</div>
	{/if}
</div>

<!-- Code Preview Popup -->
<Popup show={!!preview.source} onShow={() => window.hljs.highlightAll()}>
	<div>
		{#if preview.size}
			<div class="small preview-stats">
				<div><strong>File: </strong>{preview.file}</div>
				<strong>Previewed: </strong>{preview.size} of {preview.fileSize}
			</div>
		{/if}

		<pre>
			<code class="language-{preview.language || 'text'}">
				{@html preview.source}
			</code>
	</pre>
	</div>
</Popup>

<style lang="scss">
	.page-logo {
		text-align: center;
		img {
			max-width: 70%;
		}
	}
	.preview-stats {
		padding: 5px 0;
	}

	.sort {
		text-align: center;
	}
	pre {
		border-top: 1px solid #eee;
		text-wrap: wrap;
		margin: 0;
	}
	.flex-mid {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	input {
		font-size: 1.5em;
		flex: 1;

		&:focus {
			outline-color: #ff156d;
		}
	}

	.input {
		position: relative;
		flex: 1;
	}
	.loading {
		position: absolute;
		right: 5px;
		top: 10px;

		:global(svg) {
			height: 30px;
		}
	}

	.results {
		display: flex;
		flex-direction: column;
		gap: 0.15em;
		margin: 20px 0 10px;
		border: 1px solid #ddd;
		background: #fafafa;
		padding: 10px;
		border-radius: 10px;

		.results-stats {
			display: flex;
			justify-content: space-between;
			gap: 0.15em;

			select {
				padding: 5px;
				border: 1px solid #aaa;
				border-radius: 4px;
				resize: vertical;
				border-radius: 10px;
				font-size: 0.8em;
				width: 100%;
				margin-left: 5px;
			}
		}

		.found {
			padding: 0;
			margin: 0 0 10px;
		}

		.hits {
			display: flex;
			flex-direction: column;
			gap: 0.5em;

			.hit {
				margin: 0;
				padding: 10px;
				background: #fff;
				box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
				.file {
					// border-bottom: 1px solid #ddd;
					padding-bottom: 10px;
					display: flex;
					justify-content: space-between;
					gap: 0.5em;

					.file-path {
						flex: 1;
						text-wrap: wrap;
						overflow-x: auto;
						background: #f7f7f7;
						padding: 5px;
						border-radius: 10px;
					}
				}
			}
		}
	}

	.small {
		color: #777;
		font-size: 0.95em;
		font-weight: thin;
	}
</style>
