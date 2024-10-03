/**
 * Copyright (c) 2024 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import 'dotenv/config';
import { DB } from './typesense';
import sh from 'shorthash';
import path from 'path';
import { promises as fs } from 'fs';
import { arrify, delay, numberOr, toTimestamp } from './utils';
import { globbyStream } from 'globby';
import { readChunk } from 'read-chunk';
import mime from 'mime-types';
import isUtf8 from 'isutf8';
import _ from 'lodash';
import bytes from 'bytes';
import codeDetector from 'code-detector';
import { promises as fs } from 'node:fs';
// import languageEncoding from "detect-file-encoding-and-language";

// const MAX_STRING_LENGTH = Math.ceil(NodeBuffer.constants.MAX_STRING_LENGTH / 5);

const BULK_DOC_COUNT = numberOr(process.env.BULK_DOC_COUNT, 50);
const MAX_FILE_SIZE = numberOr(
  bytes(process.env.MAX_FILE_SIZE || '1MB'),
  bytes('1MB')
);

export class Indexer {
  isRunning: boolean = false;
  isReady: boolean = false;
  db;
  opts: object;

  constructor({ drop = false } = {}) {
    this.opts = { drop };
    this.init();
  }

  async init() {
    if (this.isReady) return;

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
        { name: 'utf8', type: 'bool' },
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
        // { name: 'path', type: 'string' },
        { name: '.*', type: 'auto' },
      ],
    };

    await this.db.createCollection(filesShema, this.opts);
    await this.db.createCollection(dirsSchema, this.opts);

    await delay(1000);
    this.isReady = true;
  }

  async addDir(directory: string) {
    await this.init();

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
    await this.init();

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

  private async globFiles(
    directory: string,
    ignorePatterns: Array<string> | string,
    skipTypes: Array<string>
  ) {
    ignorePatterns = arrify(
      ignorePatterns || (process.env.IGNORE_PATTERNS || '').split(',')
    );

    skipTypes = skipTypes || ['image', 'audio', 'video'];

    directory = path.resolve(directory);

    //   console.log(negPatterns);

    let pattern = [path.join(directory, '**/*')];
    let config = { gitignore: false, ignore: ignorePatterns };

    // console.log({ directory, pattern, config });

    //   const paths = await globby(pattern, config);
    let globStream = globbyStream(pattern, config);

    let docs = [];
    let bulkDocs = BULK_DOC_COUNT;
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

  private async indexFile(filePath: string, skipTypes: Array<string>) {
    // quickly check if file is utf8
    const buf = await readChunk(filePath, {
      length: MAX_FILE_SIZE,
      startPosition: 0,
    });
    const type = (mime.lookup(filePath) || '').split('/').shift();
    const ext = path.extname(filePath).slice(1);
    const stat = await fs.stat(filePath);
    const isUTF8 = isUtf8(buf);
    const filePathArr = _.compact(filePath.split(path.sep));

    let text = '_';
    let source = '_';
    let lang = 'Unknown';

    // ig utf8.
    if (isUTF8 && skipTypes.indexOf(type) == -1) {
      source = new TextDecoder().decode(buf);
      text = _.uniq(source.match(/([\w]+)/gi)).join(' ');
      lang = await codeDetector(filePath);
    }

    // Do we need this?
    // let langEncoding = await languageEncoding(filePath);
    // console.log({ isUTF8 });

    let doc = {
      id: sh.unique(filePath),
      text,
      source,
      ext,
      utf8: isUTF8,
      file: filePath,
      path: filePathArr,
      size: stat.size,
      created: toTimestamp(stat.birthtime),
      modified: toTimestamp(stat.mtime),
      language: lang || 'Unknown',
    };

    return doc;
  }
}
