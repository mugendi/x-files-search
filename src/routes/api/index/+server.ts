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
  // while (true) {
  try {

    indexer.indexFiles()

    return json({ message: 'OK' });
  } catch (err) {
    console.error(err);
    error(500);
  }
}
