/**
 * Copyright (c) 2024 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
// https://joyofcode.xyz/sveltekit-loading-data#api-endpoints

import { Indexer } from '$lib/indexer';
import { json, error } from '@sveltejs/kit';
import { promises as fs } from 'fs';
import path from 'path';
import util from 'util';

const indexer = new Indexer();

export async function GET({ params, url }) {
  let q = url.searchParams.get('q') || '';
  let language = url.searchParams.get('lang');
  let sort = url.searchParams.get('sort');
  let limit = url.searchParams.get('limit');
  let page = url.searchParams.get('page');

  // console.log({ sort });

  // while (true) {
  try {
    let searchParameters = {
      q,
      collections: 'local_files',

      query_by: ['source', 'text', 'path'],
      query_by_weights: '3,2,1',

      include_fields: [
        'ext',
        'file',
        'size',
        'utf8',
        // 'text',
        'created',
        'modified',
        'language',
      ],

      highlight_fields: ['source'],
      facet_by: 'language',
      sort_by: sort || 'modified:desc',

      remote_embedding_timeout_ms: 60000,
      limit: limit || 20,
      page: page || 1,
    };

    if (language) {
      searchParameters.filter_by = `language:=${language}`;
    }

    // console.log(searchParameters)

    let resp = await indexer.db.client
      .collections(['local_files'])
      .documents()
      .search(searchParameters);

    // resp = await indexer.db.client.collections('local_files').retrieve();

    // console.log(util.inspect(resp, { colors: true, depth: 6 }));
    return json(resp);
  } catch (error) {
    console.error(error);
  }

  // return new Response('Hello', {});
}

export async function POST(event) {
  const data = await event.request.formData();
  let directory = data.get('directory');

  // directory = '/media/mugz/24c84459-2953-448a-8e7d-c1d3e587fbaa1/Projects/node';

  await fs.access(directory).catch((e) => {
    error(404, `Directory ${directory} does not exist!`);
  });


  await indexer.addDir(directory);

  indexer.indexFiles();

  // return success
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
