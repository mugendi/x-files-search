<!--
 Copyright (c) 2024 Anthony Mugendi
 
 This software is released under the MIT License.
 https://opensource.org/licenses/MIT
-->

<!-- /components/Popup.svelte -->

<script>
	import { fade } from 'svelte/transition';
	export let show = false;
	export let updateContents = '';

	/**
	 * @type {HTMLDivElement}
	 */
	let popupElement;

	let dims = {};

	const nullFunc = () => {};
	export let onShow = nullFunc;
	export let onClose = nullFunc;

	function triggerOnEvent() {
		if (show) {
			onShow(popupElement);
		} else {
			onClose(popupElement);
		}
	}

	$: if (popupElement) {
		// wait a little for the dom to actually initialize
		setTimeout(() => {
			triggerOnEvent(show);
		}, 100);
	}

	$: if (popupElement && show) {
		if (updateContents) null;
		setTimeout(() => {
			dims = popupElement.getBoundingClientRect();
		}, 500);
	}

	//$: console.log({ dims });
</script>

{#if show}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="popup-overlay"
		on:click|self={() => (show = false)}
		transition:fade={{ delay: 0, duration: 500 }}
		style="--width:{dims.width - 20}px;--height:{dims.height - 20}px"
	>
		<div class="popup-content" bind:this={popupElement}>
			<div>
				<slot></slot>
				{@html updateContents}
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	.popup-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		// z-index: 1000;
	}

	.popup-content {
		background: white;
		padding: 10px;
		width: 80%;
		height: 80%;
		overflow: hidden;
		border-radius: 10px;
		// width: auto;
		// min-width: 50%;

		& > div {
			width: var(--width);
			height: var(--height);
			overflow: auto;
			scrollbar-width: thin;
		}
	}
</style>
