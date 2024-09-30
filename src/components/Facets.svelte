<!--
 Copyright (c) 2024 Anthony Mugendi
 
 This software is released under the MIT License.
 https://opensource.org/licenses/MIT
-->

<script lang="ts">
	import { formatNumber } from '$lib/utils';

	export let results = {};
	export let selectedLang: string | null = null;
	export let asStats: boolean = false;

	function setLangauge(lang: string) {
		if (selectedLang == lang) {
			selectedLang = null;
		} else {
			selectedLang = lang;
		}
	}
</script>

{#if results && results.facet_counts}
	<div class:stats={asStats}>
		{#if asStats}
			<h4>{formatNumber(results.out_of)} Files indexed</h4>
		{/if}

		<div class="small facets" class:in-stats={asStats}>
			<div class="type">
				{#each results.facet_counts[0].counts as { value, count }}
					<button class="small" on:click={() => setLangauge(value)}>
						{value}: {formatNumber(count)}
					</button>
				{/each}

				{#if selectedLang && !asStats}
					<span> &nbsp; 👈 Click to clear filter</span>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	.stats {
		border: 1px solid #ddd;
		padding: 10px;
		border-radius: 10px;
		// background: #fafafa;

		h4 {
			margin: 5px;
		}
	}
	.facets {
		display: flex;
		flex-direction: row;
		margin: 10px 0 10px;
		align-items: center;

		gap: 0.15em;
		padding: 1em 0;
		margin: 1em 0;
		border-top: 1px solid #ddd;
		border-bottom: 1px solid #ddd;

		&.in-stats {
			border-bottom: none;
			margin: 0 0;
            padding: .5em 0 0;
		}

		.type {
			display: flex;
			flex-wrap: wrap;
			gap: 0.1em;

			button {
				cursor: pointer;
				margin: 2px;
			}
		}
	}
</style>
