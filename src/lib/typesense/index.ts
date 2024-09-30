/**
 * Copyright (c) 2024 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import 'dotenv/config';
import Typesense from 'typesense';
import _ from 'lodash';
import { delay } from '../utils';
import printLine from 'printline';

type Nullable<T> = T | null;

interface SearchParams {
  query_by: Array<string>;
  facet_by?: Nullable<string>;
  sort_by?: Nullable<string>;
}

// console.log(process.env);

export class DB {
  client;
  collections: Array<string>;
  docsUpserted: number;

  constructor() {
    this.client = new Typesense.Client({
      nodes: [
        {
          host: 'localhost', // For Typesense Cloud use xxx.a1.typesense.net
          port: process.env.API_PORT, // For Typesense Cloud use 443
          protocol: 'http', // For Typesense Cloud use https
        },
      ],
      apiKey: process.env.API_KEY,
      connectionTimeoutSeconds: 2,
    });

    // console.log({ port, host, protocol });
    this.init();
    this.docsUpserted = 0;
  }

  async init() {
    if (this.collections) return;

    this.collections = await this.client.collections().retrieve();
  }

  async createCollection(
    schema: Object,
    { drop = false, update = false } = {}
  ) {
    try {
      await this.init();

      let { name } = schema;

      if (_.find(this.collections, { name })) {
        if (!drop && !update) {
          console.error(`The collection "${name}" already exists!`);
          return;
        }
        // if update
        else if (update) {
          await this.client.collections(name).update(schema);
          console.error(`The collection "${name}" updated!`);
          return;
        }
        // if drop
        else if (drop) {
          await this.client.collections(name).delete();
        }
      }

      await this.client.collections().create(schema);

      console.error(`The collection "${name}" created!`);
      await delay(1000);

      // console.log(schema);
    } catch (error) {
      console.log('ERROR');
      console.error(error);
    }
  }

  async index(collection: string, docs: Array<Object>) {
    await this.init();

    try {
      // upsert records

      let resp;

      while (true) {
        resp = await this.client
          .collections(collection)
          .documents()
          .import(docs, { action: 'upsert' })
          .catch(console.error);

        if (resp) break;
      }
      this.docsUpserted += resp.length;

      
      printLine(`Upserted ${this.docsUpserted} documents.`);

      await delay(20);
    } catch (error) {
      console.error(error);
    }
  }

  async search(
    collections: Array<String> = [],
    q: string = '',
    {
      query_by = ['text', 'path'],
      facet_by = 'ext',
      sort_by = 'size:desc',
    }: SearchParams
  ) {
    let searchParameters = {
      q,
      query_by,
      facet_by,
      sort_by,
      collections,
    };

    let resp = await this.client
      .collections(collections)
      .documents()
      .search(searchParameters);

    return resp;
  }
}
