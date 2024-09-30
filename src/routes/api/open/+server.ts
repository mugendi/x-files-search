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
import { promises as fs } from 'fs';
import { readChunk } from 'read-chunk';
import bytes from 'bytes';

const MAX_FILE_SIZE = bytes('1MB');

export async function GET({ params, url }) {
  let action = url.searchParams.get('action');
  let openPath = url.searchParams.get('path');

  if (action) {
    // console.log({ action, openPath });
    let source = null;

    try {
      switch (action) {
        case 'open-file':
          await open(openPath, { wait: true });
          break;

        case 'open-dir':
          await open(path.dirname(openPath), { wait: true });
          break;

        case 'view-source':
          // await open(path.dirname(openPath), { wait: true });
          // data = await fs.readFile(openPath, utf8);
          let buf = await readChunk(openPath, {
            length: MAX_FILE_SIZE,
            startPosition: 1,
          });

          source = new TextDecoder().decode(buf);

          break;

        default:
          break;
      }
    } catch (e) {
      console.error(e);
      error(500, 'Failed to open ' + path);
    }

    let resp = { message: 'success', opened: openPath };

    // add source if existing
    if (source) {
      let stat = await fs.stat(openPath);
      resp.source = source;
      resp.previewSize =
        stat.size > MAX_FILE_SIZE ? bytes(MAX_FILE_SIZE) : null;
      resp.fileSize = bytes(stat.size);
    }

    return json(resp);
  }
}
