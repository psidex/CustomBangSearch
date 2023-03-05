import { Settings } from '../lib/settings';

// A lookup table for { bang : [redirect urls] }.
export type BangsLookup = { [key: string]: string[] };

// A global single var to hold the current lookup object.
let bangsLookup: BangsLookup = {};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function bangsLookupFromSettings(s: Settings): BangsLookup {
  const l: BangsLookup = {};
  for (const sb of s.bangs) {
    l[sb.bang] = sb.urls;
  }
  return l;
}

export function setBangsLookup(obj: Settings): void {
  bangsLookup = bangsLookupFromSettings(obj);
}

export function getBangsLookup(): Readonly<BangsLookup> {
  return bangsLookup;
}
