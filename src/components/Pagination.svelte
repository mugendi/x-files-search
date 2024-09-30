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
        endItem,
      });
    }
  
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
  </script>
  
  <nav aria-label="Pagination">
    <ul class="pagination">
      <li class="page-item" class:disabled={currentPage === 1}>
        <button class="page-link" on:click={() => goToPage(currentPage - 1)} aria-label="Previous">
          &laquo; Prev
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
          Next &raquo;
        </button>
      </li>
    </ul>
  </nav>
  
  <style>
    nav{
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
      border: 1px solid #ccc;
      background-color: #fff;
      color: #333;
      text-decoration: none;
      cursor: pointer;
    }
  
    .page-item.active .page-link {
      background-color: var(--title-color);
      color: #fff;
      border-color: var(--title-color);
      font-weight: 600;
    }
  
    .page-item.disabled .page-link {
      color: #6c757d;
      pointer-events: none;
      cursor: not-allowed;
    }
  </style>
  