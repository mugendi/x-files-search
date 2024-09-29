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
  let q = url.searchParams.get('q');
  let language = url.searchParams.get('lang');
  let sort = url.searchParams.get('sort');

  // console.log({ sort });

  if (q && q.length > 2) {
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
          // 'text',
          'created',
          'modified',
          'language',
        ],

        highlight_fields: ['source'],
        facet_by: 'language',
        sort_by: sort || 'modified:desc',

        remote_embedding_timeout_ms: 60000,
        limit: 100,
      };

      if (language) {
        searchParameters.filter_by = `language:=${language}`;
      }

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

    //   await delay(100);
    // }

    // console.log(resp);
  }

  // console.log(event.request, Object.keys(event.request));

  // const options: ResponseInit = {
  //   status: 418,
  //   headers: {
  //     X: 'Gon give it to ya',
  //   },
  // };

  // return new Response('Hello', {});
}

export async function POST(event) {
  const data = await event.request.formData();
  let directory = data.get('directory');

  // directory = '/media/mugz/24c84459-2953-448a-8e7d-c1d3e587fbaa1/Projects/node';

  await fs.access(directory).catch((e) => {
    error(404, `Directory ${directory} does not exist!`);
  });

  console.log({ directory });

  await indexer.addDir(directory);

  setTimeout(() => {
    indexer.indexFiles();
  }, 1000);

  // return success
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
