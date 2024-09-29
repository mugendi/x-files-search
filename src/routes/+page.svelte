<script lang="ts">
	import { formatNumber, highlightMatch } from '$lib/typesense/utils';
	import { fade } from 'svelte/transition';
	import dirIcon from '../lib/images/icons/dir.svg?raw';
	import fileIcon from '../lib/images/icons/file.svg?raw';
	import loadingSVG from '../lib/images/loading.svg?raw';
	import logoImg from '../lib/images/logo-w-text.png';

	let timeoutInt: number;
	let searchResults: object = {};
	let selectedLang: string | null = null;
	let query: string | null = null;
	let searchEl;
	let isBusy: boolean = false;

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

		for (let k in queryObj) {
			if (queryObj[k] && queryObj[k].length > 1) {
				queryArr.push(`${k}=${encodeURIComponent(queryObj[k])}`);
			}
		}

		if (queryArr.length) {
			let url = '/api/directory?' + queryArr.join('&');
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

	$: {
		let queryObj = { q: query, lang: selectedLang };
		searchFiles(queryObj);
	}
</script>

<svelte:head>
	<title>X-Files-Search</title>
	<meta name="description" content="The amazing indexer for files on your system!" />
</svelte:head>

<div class="text-column">
	<!-- <h1>Search Your Files</h1> -->

	<!-- <form action="/api/directory" method="POST" use:enhance>
		<div class="field">
			<input
				type="text"
				name="directory"
				required
				value="/media/mugz/24c84459-2953-448a-8e7d-c1d3e587fbaa1/Projects"
			/>
			<button>Add Dir</button>
		</div>
	</form> -->
	{#if !query}
		<div class="page-logo" transition:fade={{ delay: 250, duration: 300 }}>
			<img src={logoImg} alt="" />
		</div>
	{/if}

	<div class="field">
		<input
			type="text"
			on:input={search}
			placeholder="Start Typing Your Search..."
			bind:this={searchEl}
		/>
		<!-- <button>Search</button> -->

		{#if isBusy}
			<span class="loading" transition:fade={{ delay: 250, duration: 300 }}>
				{@html loadingSVG}
			</span>
		{/if}
	</div>
	<!-- <button>Index Files</button> -->

	{#if searchResults.hits && searchResults.hits.length}
		<div class="results" transition:fade={{ delay: 250, duration: 300 }}>
			<div class="found">
				<h4>
					{formatNumber(searchResults.found)} Total Results Found / {formatNumber(
						searchResults.out_of
					)} indexed.
				</h4>

				<div class="small facets">
					<div class="by">LANGUAGE:</div>
					<div class="type">
						{#each searchResults.facet_counts[0].counts as { value, count }}
							<button class="small" on:click={() => setLangauge(value)}
								>{value}: {formatNumber(count)}
							</button>
						{/each}

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
								{#if highlight.source?.snippet}
									{document.file}
								{:else}
									{@html highlightMatch(document.file, query)}
								{/if}
							</span>

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
						</div>

						{#if highlight.source?.snippet}
							<pre>{@html highlight.source?.snippet || ''}</pre>
						{/if}
					</div>
				{/each}
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
		gap: 0.15em 0;
		margin: 20px 0 10px;
		border: 1px solid #ddd;
		background: #f8f8f8;
		padding: 10px;
		border-radius: 10px;

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
			gap: 1em;
			.hit {
				margin: 0;
				padding: 10px;
				background: #fff;
				.file {
					// border-bottom: 1px solid #ddd;
					padding-bottom: 10px;
					display: flex;
					align-items: center;
					justify-content: space-between;
					gap: 0.2em;

					.file-path {
						flex: 1;
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
