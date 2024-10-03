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
	import ms from 'ms';

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
		preview.source = null;
		preview.size = null;

		let url = '/api/open?action=' + action + '&path=' + encodeURIComponent(path);
		let resp = await fetch(url);
		let respData = await resp.json();

		isBusy = false;

		let language = 'plaintext';

		if (doc.language !== 'Unknown') {
			language = doc.language.toLowerCase();
			language = langSubsets(language) || language;
		}

		// show source
		if (respData.source) {
			preview.size = respData.previewSize || respData.fileSize;
			preview.file = doc.file;
			preview.fileSize = respData.fileSize;
			preview.language = language;
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

	async function loadLanguage(lang) {
		const supportedLangs = [
			'1c',
			'abnf',
			'accesslog',
			'actionscript',
			'ada',
			'angelscript',
			'apache',
			'applescript',
			'arcade',
			'arduino',
			'armasm',
			'asciidoc',
			'aspectj',
			'autohotkey',
			'autoit',
			'avrasm',
			'awk',
			'axapta',
			'bash',
			'basic',
			'bnf',
			'brainfuck',
			'c',
			'cal',
			'capnproto',
			'ceylon',
			'clean',
			'clojure',
			'clojure-repl',
			'cmake',
			'coffeescript',
			'coq',
			'cos',
			'cpp',
			'crmsh',
			'crystal',
			'csharp',
			'csp',
			'css',
			'd',
			'dart',
			'delphi',
			'diff',
			'django',
			'dns',
			'dockerfile',
			'dos',
			'dsconfig',
			'dts',
			'dust',
			'ebnf',
			'elixir',
			'elm',
			'erb',
			'erlang',
			'erlang-repl',
			'excel',
			'fix',
			'flix',
			'fortran',
			'fsharp',
			'gams',
			'gauss',
			'gcode',
			'gherkin',
			'glsl',
			'gml',
			'go',
			'golo',
			'gradle',
			'graphql',
			'groovy',
			'haml',
			'handlebars',
			'haskell',
			'haxe',
			'hsp',
			'http',
			'hy',
			'inform7',
			'ini',
			'irpf90',
			'isbl',
			'java',
			'javascript',
			'jboss-cli',
			'json',
			'julia',
			'julia-repl',
			'kotlin',
			'lasso',
			'latex',
			'ldif',
			'leaf',
			'less',
			'lisp',
			'livecodeserver',
			'livescript',
			'llvm',
			'lsl',
			'lua',
			'makefile',
			'markdown',
			'mathematica',
			'matlab',
			'maxima',
			'mel',
			'mercury',
			'mipsasm',
			'mizar',
			'mojolicious',
			'monkey',
			'moonscript',
			'n1ql',
			'nestedtext',
			'nginx',
			'nim',
			'nix',
			'node-repl',
			'nsis',
			'objectivec',
			'ocaml',
			'openscad',
			'oxygene',
			'parser3',
			'perl',
			'pf',
			'pgsql',
			'php',
			'php-template',
			'plaintext',
			'pony',
			'powershell',
			'processing',
			'profile',
			'prolog',
			'properties',
			'protobuf',
			'puppet',
			'purebasic',
			'python',
			'python-repl',
			'q',
			'qml',
			'r',
			'reasonml',
			'rib',
			'roboconf',
			'routeros',
			'rsl',
			'ruby',
			'ruleslanguage',
			'rust',
			'sas',
			'scala',
			'scheme',
			'scilab',
			'scss',
			'shell',
			'smali',
			'smalltalk',
			'sml',
			'sqf',
			'sql',
			'stan',
			'stata',
			'step21',
			'stylus',
			'subunit',
			'swift',
			'taggerscript',
			'tap',
			'tcl',
			'thrift',
			'tp',
			'twig',
			'typescript',
			'vala',
			'vbnet',
			'vbscript',
			'vbscript-html',
			'verilog',
			'vhdl',
			'vim',
			'wasm',
			'wren',
			'x86asm',
			'xl',
			'xml',
			'xquery',
			'yaml',
			'zephir'
		];

		if (supportedLangs[lang]) {
			const url = `https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/languages/${lang}.min.js`;
			await import(url);
		}
	}

	function langSubsets(lang) {
		const languageSubsets = {
			svelte: { subset: 'svelte', language: 'HTML' },
			vue: { subset: 'vue', language: 'HTML' },
			angular: { subset: 'angular', language: 'HTML' },
			react: { subset: 'react', language: 'JavaScript' },
			jsx: { subset: 'jsx', language: 'JavaScript' },
			tsx: { subset: 'tsx', language: 'TypeScript' },
			scss: { subset: 'scss', language: 'CSS' },
			less: { subset: 'less', language: 'CSS' },
			yaml: { subset: 'yaml', language: 'YAML' },
			markdown: { subset: 'markdown', language: 'Markdown' },
			objectivec: { subset: 'objectivec', language: 'Objective-C' },
			shell: { subset: 'shell', language: 'Bash' },
			dockerfile: { subset: 'dockerfile', language: 'Dockerfile' },
			graphql: { subset: 'graphql', language: 'GraphQL' },
			plsql: { subset: 'plsql', language: 'PL/SQL' },
			elixir: { subset: 'elixir', language: 'Elixir' },
			erlang: { subset: 'erlang', language: 'Erlang' },
			fortran: { subset: 'fortran', language: 'Fortran' },
			cobol: { subset: 'cobol', language: 'COBOL' },
			matlab: { subset: 'matlab', language: 'MATLAB' },
			scheme: { subset: 'scheme', language: 'Scheme' },
			clojure: { subset: 'clojure', language: 'Clojure' },
			coffeescript: { subset: 'coffeescript', language: 'CoffeeScript' },
			rmarkdown: { subset: 'rmarkdown', language: 'RMarkdown' }
		};

		let langObj: object = languageSubsets[lang] || {};

		return langObj.language ? langObj.language.toLowerCase() : null;
	}

	async function highlightSource(lang) {
		if (window.hljs) {
			window.hljs.highlightAll();
			await loadLanguage(lang);
		}
		if (window.hljs.initLineNumbersOnLoad) {
			window.hljs.initLineNumbersOnLoad();
		}
	}

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

	<script
		src="//cdn.jsdelivr.net/npm/highlightjs-line-numbers.js@2.8.0/dist/highlightjs-line-numbers.min.js"
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
						{formatNumber(searchResults.found)} / {formatNumber(searchResults.out_of)} Results Found
						in {ms(searchResults.search_time_ms, { long: true })}
					</h4>

					<div class="sort small">
						<div class="flex-mid">
							<img src={sortIcon} alt="sort icon" height="18px" />
							<span>SORT BY</span>
						</div>
						<select bind:value={sortOrder}>
							<option value="modified:desc">Newest</option>
							<option value="modified:asc">Oldest</option>
							<option value="size:asc">Smallest</option>
							<option value="size:desc">Largest</option>
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
									{bytes(document.size)}
									{#if document.language !== 'Unknown'}
										| <strong>Language:</strong>
										{document.language}
									{/if}
									|
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
								{#if document.utf8}
									<button
										class="small"
										on:click={() => open('view-source', document)}
										title="View Source"
										disabled={isBusy}
									>
										{@html codeIcon}
									</button>
								{/if}
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
<Popup show={!!preview.source} onShow={() => highlightSource(preview.language)}>
	<div>
		{#if preview.size}
			<div class="small preview-stats">
				<div><strong>File: </strong>{preview.file}</div>
				<strong>Previewed: </strong>{preview.size} of {preview.fileSize}
			</div>
		{/if}

		<pre>
			<code class="language-{preview.language || 'plaintext'}">
				{preview.source.trim()}
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
		padding: 0;
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

	code {
		/* for block of numbers */
		:global(.hljs-ln-numbers) {
			-webkit-touch-callout: none;
			-webkit-user-select: none;
			-khtml-user-select: none;
			-moz-user-select: none;
			-ms-user-select: none;
			user-select: none;

			text-align: center;
			color: #ccc;
			border-right: 1px solid #ccc;
			vertical-align: top;
			padding-right: 5px;

			/* your custom style here */
		}

		/* for block of code */
		:global(.hljs-ln-code) {
			padding-left: 10px;
		}
	}
</style>
