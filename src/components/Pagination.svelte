<!--
 Copyright (c) 2024 Anthony Mugendi
 
 This software is released under the MIT License.
 https://opensource.org/licenses/MIT
-->

<script>
	export let totalItems = 0;
	export let itemsPerPage = 10;
	export let pagesShown = 4;
	export let currentPage = 1;

	export let startItem;
	export let endItem;

	$: totalPages = Math.ceil(totalItems / itemsPerPage);
	$: halfPagesShown = Math.floor(pagesShown / 2);
	$: paginationArray = getPaginationArray(currentPage, totalPages, pagesShown);

	$: startItem = (currentPage - 1) * itemsPerPage;
	$: endItem = Math.min(startItem + itemsPerPage, totalItems);

	function getPaginationArray(current, total, shown) {
		if (total <= shown) {
			return Array.from({ length: total }, (_, i) => i + 1);
		}

		let start = Math.max(current - halfPagesShown, 1);
		let end = Math.min(start + shown - 1, total);

		if (end - start + 1 < shown) {
			start = Math.max(end - shown + 1, 1);
		}

		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	}

	function goToPage(page) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
			dispatchPageChange();
		}
	}

	function dispatchPageChange() {
		dispatch('pageChange', {
			currentPage,
			startItem,
			endItem
		});
	}

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
</script>

<nav aria-label="Pagination">
	<ul class="pagination">

	  <li class="page-item" class:disabled={currentPage === 1}>
			<button class="page-link" on:click={() => goToPage(1)} aria-label="Previous">
				<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M18.3956 19.7691C19.0541 20.2687 20 19.799 20 18.9724L20 5.02764C20 4.20106 19.0541 3.73137 18.3956 4.23095L9.20476 11.2033C8.67727 11.6035 8.67727 12.3965 9.20476 12.7967L18.3956 19.7691ZM22 18.9724C22 21.4521 19.1624 22.8612 17.1868 21.3625L7.99598 14.3901C6.41353 13.1896 6.41353 10.8104 7.99599 9.60994L17.1868 2.63757C19.1624 1.13885 22 2.5479 22 5.02764L22 18.9724Z" fill="#0F0F0F"></path> <path d="M2 3C2 2.44772 2.44772 2 3 2C3.55228 2 4 2.44772 4 3V21C4 21.5523 3.55228 22 3 22C2.44772 22 2 21.5523 2 21V3Z" fill="#0F0F0F"></path> </g></svg>
			</button>
		</li>
    
		<li class="page-item" class:disabled={currentPage === 1}>
			<button class="page-link" on:click={() => goToPage(currentPage - 1)} aria-label="Previous">
				<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16.1795 3.26875C15.7889 2.87823 15.1558 2.87823 14.7652 3.26875L8.12078 9.91322C6.94952 11.0845 6.94916 12.9833 8.11996 14.155L14.6903 20.7304C15.0808 21.121 15.714 21.121 16.1045 20.7304C16.495 20.3399 16.495 19.7067 16.1045 19.3162L9.53246 12.7442C9.14194 12.3536 9.14194 11.7205 9.53246 11.33L16.1795 4.68297C16.57 4.29244 16.57 3.65928 16.1795 3.26875Z" fill="#0F0F0F"></path> </g></svg>
			</button>
		</li>

		{#each paginationArray as page}
			<li class="page-item" class:active={page === currentPage}>
				<button class="page-link" on:click={() => goToPage(page)}>
					{page}
				</button>
			</li>
		{/each}

		<li class="page-item" class:disabled={currentPage === totalPages}>
			<button class="page-link" on:click={() => goToPage(currentPage + 1)} aria-label="Next">
				<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7.82054 20.7313C8.21107 21.1218 8.84423 21.1218 9.23476 20.7313L15.8792 14.0868C17.0505 12.9155 17.0508 11.0167 15.88 9.84497L9.3097 3.26958C8.91918 2.87905 8.28601 2.87905 7.89549 3.26958C7.50497 3.6601 7.50497 4.29327 7.89549 4.68379L14.4675 11.2558C14.8581 11.6464 14.8581 12.2795 14.4675 12.67L7.82054 19.317C7.43002 19.7076 7.43002 20.3407 7.82054 20.7313Z" fill="#0F0F0F"></path> </g></svg>
			</button>
		</li>

		<li class="page-item" class:disabled={currentPage === totalPages }>
			<button class="page-link" on:click={() => goToPage(totalPages)} aria-label="Next">
				<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M5.60439 4.23093C4.94586 3.73136 4 4.20105 4 5.02762V18.9724C4 19.799 4.94586 20.2686 5.60439 19.7691L14.7952 12.7967C15.3227 12.3965 15.3227 11.6035 14.7952 11.2033L5.60439 4.23093ZM2 5.02762C2 2.54789 4.83758 1.13883 6.81316 2.63755L16.004 9.60993C17.5865 10.8104 17.5865 13.1896 16.004 14.3901L6.81316 21.3625C4.83758 22.8612 2 21.4521 2 18.9724V5.02762Z" fill="#0F0F0F"></path> <path d="M20 3C20 2.44772 20.4477 2 21 2C21.5523 2 22 2.44772 22 3V21C22 21.5523 21.5523 22 21 22C20.4477 22 20 21.5523 20 21V3Z" fill="#0F0F0F"></path> </g></svg>
			</button>
		</li>
	</ul>
</nav>

<style lang="scss">
	nav {
		display: flex;
		justify-content: end;
	}

	.pagination {
		display: flex;
		list-style-type: none;
		padding: 0;
		margin: 10px 0;
	}

	.page-item {
		margin: 0 2px;
	}

	.page-link {
		padding: 5px 10px;
		border: 1px solid #ddd;
		background-color: #eee;
		color: #333;
		text-decoration: none;
    height: 30px;
		cursor: pointer;
	}

	.page-item.active .page-link {
		background-color: #fff;
		color: #333;
		border-color: #999;
		font-weight: 600;
	}

	.page-item.disabled .page-link {
		color: #ccc;
		pointer-events: none;
		cursor: not-allowed;

    :global(svg){
      stroke: #eee;
    }
	}
</style>
