import browser from 'webextension-polyfill';
import { Settings } from '../lib/settings';

// TODO: Look into localstorage storage limits for this and ignoreddomains!
// TODO: Same places, check if get is undefined and return default value.

// A lookup table for { bang : [redirect urls] }.
export type BangsLookup = { [key: string]: string[] };

function bangsLookupFromSettings(s: Settings): BangsLookup {
  const l: BangsLookup = {};
  for (const sb of s.bangs) {
    l[sb.bang] = sb.urls;
  }
  return l;
}

export function setBangsLookup(obj: Settings): void {
  const bangsLookup = bangsLookupFromSettings(obj);
  browser.storage.local.set({ bangsLookup });
}

export async function getBangsLookup(): Promise<Readonly<BangsLookup>> {
  const { bangsLookup } = await browser.storage.local.get('bangsLookup');
  return Promise.resolve(bangsLookup);
}
