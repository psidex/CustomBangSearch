// Below are a couple of types and a function that create a different representation of
// StoredBangInfo, mainly so that random IDs are generated for each array item, and we
// keep track of the positions of things. This is to help with rendering.

// Maps are used because they keep track of insertion order. When saving, they are
// converted back to arrays, which also keep insertion order. This means we never have
// to manually keep track of the order of things (since the user can't change the order
// this means the order should always be the same).

import { nanoid } from 'nanoid';

import { StoredBangInfo } from '../lib/settings';

// Map of random ID : url
export type ReactfulUrlInfo = Map<string, string>;

export type ReactfulBangInfo = {
  bang: string
  pos: number,
  urls: ReactfulUrlInfo
};

// Key is random ID
// export type ReactfulBangInfoContainer = Map<string, ReactfulBangInfo>;
export type ReactfulBangInfoContainer = {
  [ key: string ]: ReactfulBangInfo
};

// TODO: CURRENT: Maybe use maps as they preserve insertion order
// Does updating map mess with the order?
// Find out how to iterate map in order, apparently for-in is not good
// https://stackoverflow.com/a/5525820/6396652
// https://www.thecodeship.com/web-development/common-pitfalls-when-working-with-javascript-arrays/
// This will remove the need for storing pos, as pos in the first place was just storing
// insertion order#
// This should also remove the need to sort like we are in BangsTabPanel

/**
 * Convert stored to reactful info.
 * This should only be run once per session.
 * @param s The stored bang info from the up to date settings object.
 * @returns The reactful representation.
 */
export function storedBangInfoToReactful(s: StoredBangInfo[]): ReactfulBangInfoContainer {
  const reactfulBangs: ReactfulBangInfoContainer = {};

  // TODO: I think we can probably remove ID and pos from stored settings.

  // Array order is preserved wherever the settings go (whether they are serialized,
  // send through runtime, iterated, etc.) so we can rely on their index as a way to
  // "remember" the position of things in the UI (which shouldn't change, as it isn't
  // changable by the user).

  for (const [i, storedBang] of s.entries()) {
    const b: ReactfulBangInfo = {
      bang: storedBang.bang,
      pos: i,
      urls: new Map(),
    };

    for (const storedUrl of storedBang.urls) {
      b.urls.set(nanoid(21), storedUrl);
    }

    reactfulBangs[nanoid(21)] = b;
  }

  return reactfulBangs;
}
