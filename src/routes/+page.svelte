<script lang="ts">
	import { formatDate, formatNumber, highlightMatch } from '$lib/utils';
	import { fade } from 'svelte/transition';
	import dirIcon from '../lib/images/icons/dir.svg?raw';
	import fileIcon from '../lib/images/icons/file.svg?raw';
	import sortIcon from '../lib/images/icons/sort.svg';
	import loadingSVG from '../lib/images/loading.svg?raw';
	import findImg from '../lib/images/icons/find.svg';
	import logoImg from '../lib/images/logo-w-text.png';
	import { onMount } from 'svelte';
	import Pagination from '../components/Pagination.svelte';

	let timeoutInt: number;
	let searchResults: object = {};
	let selectedLang: string | null = null;
	let query: string | null = null;
	let searchEl;
	let isBusy: boolean = false;
	let isReady: boolean = false;
	let sortOrder = 'modified:desc';
	let currentPage = 1;
	let itemsPerPage = 20;

	function setLangauge(lang: string) {
		if (selectedLang == lang) {
			selectedLang = null;
		} else {
			selectedLang = lang;
		}
	}

	async function search(event: Event) {
		// debounce input events by 1 second
		clearInterval(timeoutInt);
		timeoutInt = setTimeout(async () => {
			let val: string | null = event.target?.value;
			if (val && val.length > 2) {
				query = val;
			}
		}, 1000);
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

	async function open(action: string, path: string) {
		let url = '/api/open?action=' + action + '&path=' + path;
		let resp = await fetch(url);
		let data = await resp.json();
		return data;
	}

	onMount(() => {
		isReady = true;
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

	// $: console.log({ currentPage });
</script>

<svelte:head>
	<title>X-Files-Search</title>
	<meta name="description" content="The amazing indexer for files on your system!" />
</svelte:head>

<div class="text-column" class:wide={searchResults.hits}>
	<!-- <h1>Search Your Files</h1> -->

	{#if !searchResults.hits}
		<div class="page-logo" transition:fade={{ delay: 250, duration: 300 }}>
			<img src={logoImg} alt="" />
		</div>
	{/if}

	<div class="field">
		<input
			type="text"
			on:input={search}
			placeholder={isReady ? 'Search your local files' : 'Getting Search Ready...'}
			bind:this={searchEl}
			disabled={!isReady || isBusy}
		/>
		<!-- <button>Search</button> -->

		{#if isBusy || !isReady}
			<span class="loading" transition:fade={{ delay: 0, duration: 200 }}>
				{@html loadingSVG}
			</span>
		{/if}
	</div>

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
									<strong>Modified:</strong>
									{formatDate(document.modified * 1000)}
								</div>
							</span>

							<span>
								<button
									class="small"
									on:click={() => open('open-dir', document.file)}
									title="Open Containing Directory"
								>
									{@html dirIcon}
								</button>
								<button
									class="small"
									on:click={() => open('open-file', document.file)}
									title="Open File"
								>
									{@html fileIcon}
								</button>
							</span>
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

<style lang="scss">
	.page-logo {
		text-align: center;
		img {
			max-width: 70%;
		}
	}
	.flex-mid {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	input {
		font-size: 1.5em;

		&:focus {
			outline-color: #ff156d;
		}
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
				pre {
					border-top: 1px solid #eee;
					text-wrap: wrap;
					margin: 0;
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
