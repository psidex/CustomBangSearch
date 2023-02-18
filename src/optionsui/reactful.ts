//
// reactful.ts
//
// Below are a couple of types and function(s) that create a different representation of
// StoredBangInfo, mainly so that we can use maps instead of arrays. This allows us to
// store a random ID alongside each item, for use as a key in react. Maps also keep track
// of the insertion order of items, and always iterate in that order. This help with
// rendering in the same order every time (the same advantage as an array).
//
// When saving, maps are converted back to arrays, which also keep insertion order.
// This means we never have to manually keep track of the order of things (since the
// user can't change the order this means the order should always be the same).
//

import { nanoid } from 'nanoid';

import { StoredBangInfo } from '../lib/settings';

// Map of random ID : URL
export type ReactfulUrlInfo = Map<string, string>;

export type ReactfulBangInfo = {
  bang: string
  urls: ReactfulUrlInfo
};

// Key is random ID
export type ReactfulBangInfoContainer = Map<string, ReactfulBangInfo>;

/**
 * Convert stored to reactful info.
 * This should only be run once per session.
 * @param s The stored bang info from the up to date settings object.
 * @returns The reactful representation.
 */
export function storedBangInfoToReactful(s: StoredBangInfo[]): ReactfulBangInfoContainer {
  const reactfulBangs: ReactfulBangInfoContainer = new Map();

  // Array order is preserved wherever the settings go (whether they are serialized,
  // send through runtime, iterated, etc.) so we can rely on their index as a way to
  // "remember" the position of things in the UI (which shouldn't change, as it isn't
  // changable by the user).

  for (const storedBang of s) {
    const b: ReactfulBangInfo = {
      bang: storedBang.bang,
      urls: new Map(),
    };

    for (const storedUrl of storedBang.urls) {
      b.urls.set(nanoid(21), storedUrl);
    }

    // We use nanoid(21), because thats the default, but passing it in means if the
    // default chanages in the future, it wont potentially break things.
    reactfulBangs.set(nanoid(21), b);
  }

  return reactfulBangs;
}

export function reactfulBangInfoToStored(r: Readonly<ReactfulBangInfoContainer>): StoredBangInfo[] {
  const bangsToStore: StoredBangInfo[] = [];

  for (const [, reactfulBang] of r) {
    const s: StoredBangInfo = {
      bang: reactfulBang.bang,
      urls: [],
    };

    for (const [, reactfulUrl] of reactfulBang.urls) {
      s.urls.push(reactfulUrl);
    }

    bangsToStore.push(s);
  }

  return bangsToStore;
}
