/**
 * Copyright (c) 2024 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
// https://joyofcode.xyz/sveltekit-loading-data#api-endpoints


import { json, error } from '@sveltejs/kit';
import open from 'open';
import path from 'path';



export async function GET({ params, url }) {
  let action = url.searchParams.get('action');
  let openPath = url.searchParams.get('path');

  if (action) {
    console.log({ action, openPath });
    try {
      switch (action) {
        case 'open-file':
          await open(openPath, { wait: true });
          break;

        case 'open-dir':
          await open(path.dirname(openPath), { wait: true });
          break;

        default:
          break;
      }
    } catch (e) {
      console.error(e);
      error(500, 'Failed to open ' + path);
    }

    return json({ message: 'success', opened: openPath });
  }
}
