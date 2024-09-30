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

	// let timeoutInt: number;
	let searchResults: object = {};
	let selectedLang: string | null = null;
	let query: string | null = null;
	let searchEl;
	let isBusy: boolean = false;
	let isReady: boolean = false;
	let sortOrder = 'modified:desc';
	let currentPage = 1;
	let itemsPerPage = 20;
	let isLocal = true;

	let previewSource: string | null = null;
	let previewLanguage: string | null = null;
	let previewSize: string | null = null;
	let previewFileSize: string | null = null;
	let fetchingSource: string | null = null;
	let searchQuery = '';

	function setLangauge(lang: string) {
		if (selectedLang == lang) {
			selectedLang = null;
		} else {
			selectedLang = lang;
		}
	}

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

		// console.log(queryObj);
		// console.log(queryArr);

		if (queryObj.q && queryArr.length) {
			let url = '/api/directory?' + queryArr.join('&');
			// console.log('URL', url);
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
		previewSource = null;
		previewSize = null;

		let url = '/api/open?action=' + action + '&path=' + path;
		let resp = await fetch(url);
		let respData = await resp.json();

		isBusy = false;

		// show source
		if (respData.source) {
			previewSize = respData.previewSize || respData.fileSize;
			previewFileSize = respData.fileSize;
			previewLanguage = doc.language == 'Unknown' ? null : doc.language;

			previewSource = `<pre><code class="language-${
				previewLanguage || 'text'
			}">' ${respData.source} </code></pre>`;
		}

		if (action == 'view-source') {
			fetchingSource = null;
		}
	}

	onMount(() => {
		isReady = true;
		isLocal = isLocalhost(window.location.hostname);
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

	// $: console.log({ previewSource, previewSize, previewFileSize });

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

					<div>
						<span class="flex-mid small">
							<img src={sortIcon} height="20" alt="" />&nbsp;Modification Date
						</span>
						<select bind:value={sortOrder}>
							<option value="modified:asc">Ascending</option>
							<option value="modified:desc">Descending</option>
						</select>
					</div>
				</div>
				<div class="small facets">
					<!-- <div class="by">LANGUAGE:</div> -->
					<div class="type">
						<div>
							{#each searchResults.facet_counts[0].counts as { value, count }}
								<button class="small" on:click={() => setLangauge(value)}
									>{value}: {formatNumber(count)}
								</button>
							{/each}
						</div>
						{#if selectedLang && !isBusy}
							<span> &nbsp; 👈 Click to clear <strong>"{selectedLang}"</strong> filter</span>
						{/if}
					</div>
				</div>
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
									<strong>Language:</strong>
									{document.language}
								</div>
								<div>
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
			<img src={findImg} height="100px" />
			<div>
				<h4>No files match that query and/or filters</h4>
				<p>We couldn't find a ting!! Please search more broadly!</p>
			</div>
		</div>
	{/if}
</div>

<!-- Code Preview Popup -->
<Popup show={!!previewSource} onShow={() => hljs.highlightAll()}>
	{#if previewSize}
		<div class="preview-stats small">
			{previewSize} of {previewFileSize} Previewed 👇
		</div>
	{/if}

	<pre>
		<code class="language-{previewLanguage || 'text'}">
		{previewSource} 
	</code>
	</pre>
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
		text-align: right;
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
				margin-top: 10px;
				width: 100%;
			}
		}

		.facets {
			display: flex;
			flex-direction: row;
			margin: 10px 0 10px;
			align-items: center;

			gap: 0.25em;
			padding: 1em 0;
			margin: 1em 0;
			border-top: 1px solid #ddd;
			border-bottom: 1px solid #ddd;

			.by {
				height: 100%;
				font-weight: 560;
				color: #777;
			}

			.type {
				display: flex;
				flex-wrap: wrap;
				gap: 0.2em;

				button {
					cursor: pointer;
					margin: 2px;
				}
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
