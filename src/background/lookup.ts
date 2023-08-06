import browser from 'webextension-polyfill';

import { StoredBangInfo } from '../lib/settings';

// TODO: Look into localstorage storage limits for this and other local options!

// A lookup table for { bang : [redirect urls] }.
export type BangsLookup = { [key: string]: string[] };

function bangsLookupFromSettings(bangs: StoredBangInfo[]): BangsLookup {
  const l: BangsLookup = {};
  for (const sb of bangs) {
    l[sb.bang] = sb.urls;
  }
  return l;
}

export function setBangsLookup(bangs: StoredBangInfo[]): void {
  const bangsLookup = bangsLookupFromSettings(bangs);
  browser.storage.local.set({ bangsLookup });
}

export async function getBangsLookup(): Promise<Readonly<BangsLookup>> {
  const { bangsLookup } = await browser.storage.local.get({
    // Default to empty array.
    bangsLookup: [],
  });
  return Promise.resolve(bangsLookup);
}
