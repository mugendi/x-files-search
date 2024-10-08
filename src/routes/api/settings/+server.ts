/**
 * Copyright (c) 2024 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
// https://joyofcode.xyz/sveltekit-loading-data#api-endpoints

import { Indexer } from '$lib/indexer';
import { json, error } from '@sveltejs/kit';

const indexer = new Indexer();

export async function GET({ params, url }) {
  try {
    let searchParameters = {
      q: '',
      query_by: 'directory',
      collections: 'local_directories',
    };

    let resp = await indexer.db.client
      .collections(['local_directories'])
      .documents()
      .search(searchParameters);

    // resp = await indexer.db.client.collections('local_files').retrieve();

    // console.log(util.inspect(resp, { colors: true, depth: 6 }));
    return json(resp);
  } catch (err) {
    console.error(err);
    error(500);
  }
}
