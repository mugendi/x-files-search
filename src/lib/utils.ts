/**
 * Copyright (c) 2024 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

export function delay(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function arrify(v) {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

export function numFormat(n) {
  return new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(
    n
  );
}

export function toTimestamp(strDate) {
  var datum = Date.parse(strDate);
  return datum / 1000;
}

export function formatNumber(num) {
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const suffixNum = Math.floor(Math.log10(Math.abs(num)) / 3);

  if (suffixNum === 0) return num.toString(); // Return as is for numbers < 1000

  const shortValue = (num / Math.pow(1000, suffixNum)).toFixed(2);
  return shortValue.replace(/\.?0+$/, '') + suffixes[suffixNum];
}

export function highlightMatch(text, match) {
  if (!match) return text;

  const escapedMatch = match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedMatch, 'gi');

  return text.replace(regex, '<mark>$&</mark>');
}

export function formatDate(date) {
  return new Date(date).toLocaleString();
}

export function isLocalhost(hostname) {
  // List of known localhost hostnames and IP ranges
  const localhosts = ['localhost', '127.0.0.1', '::1', '0:0:0:0:0:0:0:1'];

  // IPv4 localhost range (127.0.0.0 to 127.255.255.255)
  const ipv4LocalhostRegex =
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/;

  // Convert hostname to lowercase for case-insensitive comparison
  hostname = hostname.toLowerCase();

  return localhosts.includes(hostname) || ipv4LocalhostRegex.test(hostname);
}

export function numberOr(val: any, defaultVal: number) {
  let n = Number(val);

  // if isNaN, return default
  return n != n ? defaultVal : n;
}
