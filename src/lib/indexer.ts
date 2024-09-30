/**
 * Copyright (c) 2024 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { DB } from './typesense';
import sh from 'shorthash';
import path from 'path';
import { promises as fs } from 'fs';
import { arrify, toTimestamp } from './utils';
import { globbyStream } from 'globby';
import { readChunk } from 'read-chunk';
import mime from 'mime-types';
import isUtf8 from 'isutf8';
import _ from 'lodash';
import bytes from 'bytes';
import detect from 'language-detect';
import { promises as fs } from 'node:fs';
// import languageEncoding from "detect-file-encoding-and-language";

// const MAX_STRING_LENGTH = Math.ceil(NodeBuffer.constants.MAX_STRING_LENGTH / 5);
const MAX_FILE_SIZE = bytes('1MB');

// console.log();

export class Indexer {
  isRunning = false;
  db;

  constructor({ drop = false } = {}) {
    this.db = new DB();

    let filesShema = {
      name: 'local_files',
      fields: [
        { name: 'file', type: 'string' },
        { name: 'text', type: 'string' },
        { name: 'source', type: 'string' },
        { name: 'path', type: 'string[]' },
        { name: 'size', type: 'int32' },
        { name: 'created', type: 'int64' },
        { name: 'modified', type: 'int64' },
        // facets
        { name: 'language', type: 'string', facet: true },
        { name: 'ext', type: 'string', facet: true },

        { name: '.*', type: 'auto' },
      ],
      default_sorting_field: 'size',
    };

    let dirsSchema = {
      name: 'local_directories',
      fields: [
        { name: 'directory', type: 'string' },
        { name: '.*', type: 'auto' },
      ],
    };

    this.db.createCollection(filesShema, { drop });
    this.db.createCollection(dirsSchema, { drop });
    // console.log('>>>>>');
  }

  async addDir(directory: string) {
    // console.log({directory});
    await fs.access(directory);

    let docs = [
      {
        id: sh.unique(directory),
        directory,
      },
    ];

    // console.log(doc);

    await this.db.index('local_directories', docs);
    // console.log('');
  }

  async indexFiles() {
    if (this.isRunning) return;

    let resp = await this.db.search(['local_directories'], '', {
      query_by: ['directory'],
      facet_by: null,
      sort_by: null,
    });

    // console.log(JSON.stringify(resp?.hits, 0, 4));

    this.isRunning = true;

    for (let hit of resp?.hits || []) {
      if (!hit?.document?.directory) continue;
      console.log(`Indexing ${hit.document.directory}`);
      await this.globFiles(hit.document.directory);
    }

    this.isRunning = false;
  }

  async globFiles(
    directory: string,
    negPatterns: Array<string>,
    skipTypes: Array<string>
  ) {
    negPatterns = arrify(
      negPatterns || [
        '!**/node_modules/**',
        '!**/.env/**',
        '!**/venv**',
        '!**/.venv/**',
        //   '!**/*.md',
        //   '!**/*.json',
        //   '!**/*.yaml',
        //   '!**/*.yml',
        '!**/yarn.*',
        '!**/npm.*',
        '!**/LICENSE',
      ]
    );

    skipTypes = skipTypes || ['image', 'audio', 'video'];

    directory = path.resolve(directory);

    //   console.log(negPatterns);

    let pattern = [path.join(directory, '**/*'), ...negPatterns];
    let config = { gitignore: false };

    // console.log({ directory, pattern, config });

    //   const paths = await globby(pattern, config);
    let globStream = globbyStream(pattern, config);

    let docs = [];
    let bulkDocs = 50;
    let doc;

    for await (const filePath of globStream) {
      try {
        doc = await this.indexFile(filePath, skipTypes);

        if (!doc) continue;

        if (docs.length >= bulkDocs) {
          // console.log(docs.length);
          await this.db.index('local_files', docs);
          docs = [];
        }

        docs.push(doc);

        // break;
      } catch (error) {
        console.error(error);
      }
    }
  }

  async indexFile(filePath: string, skipTypes: Array<string>) {
    // quickly check if file is utf8
    let buf = await readChunk(filePath, { length: 1024, startPosition: 1 });
    let type = (mime.lookup(filePath) || '').split('/').shift();
    let ext = path.extname(filePath).slice(1);
    let text;
    let source;
    let lang = 'Unknown';

    // get fike stat
    let stat = await fs.stat(filePath);

    if (ext.length < 2 || !isUtf8(buf) || skipTypes.indexOf(type) > -1) {
      text = '_';
      source = '_';
    } else {
      // read chunk
      buf = await readChunk(filePath, {
        length: MAX_FILE_SIZE,
        startPosition: 1,
      });

      try {
        lang = detect.sync(filePath);
      } catch (error) {}

      source = new TextDecoder().decode(buf);
      text = _.uniq(source.match(/([\w]+)/gi)).join(' ');
    }

    const filePathArr = _.compact(filePath.split(path.sep));
    // Do we need this?
    // let langEncoding = await languageEncoding(filePath);
    // console.log(langEncoding);

    let doc = {
      id: sh.unique(filePath),
      text,
      source,
      ext,
      file: filePath,
      path: filePathArr,
      size: stat.size,
      created: toTimestamp(stat.birthtime),
      modified: toTimestamp(stat.mtime),
      language: lang,
    };

    return doc;
  }
}
