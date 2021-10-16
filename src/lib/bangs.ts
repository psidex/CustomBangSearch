import browser from 'webextension-polyfill';
import React from 'react';
import { nanoid } from 'nanoid';

const defaultJsonFilePath = '../../defaults.json';

export interface BangsType {
  [key: string]: { id: string, url: string };
}

export interface BangsTypeOld {
  [key: string]: string;
}

export type SetBangsType = React.Dispatch<React.SetStateAction<BangsType>>;

/**
 * Convert old bangs to new bangs.
 */
export function convertLegacyBangs(oldBangs: BangsTypeOld): BangsType {
  const newBangs: BangsType = {};
  for (const [bang, url] of Object.entries(oldBangs)) {
    newBangs[bang] = {
      id: nanoid(10),
      url,
    };
  }
  return newBangs;
}

/**
 * Gets the default bangs.
 */
export async function getDefaultBangs(): Promise<BangsType> {
  const r = await fetch(defaultJsonFilePath);
  return r.json();
}

/**
 * Saves the given bangs to the synced browser storage.
 */
export async function saveBangs(bangs: BangsType): Promise<void> {
  await browser.storage.sync.set({ bangs });
}

/**
 * Gets the bangs currently saved in the synced browser storage.
 */
export async function getBangs(): Promise<BangsType> {
  let { bangs } = await browser.storage.sync.get('bangs');

  // Check the first object entry. Not super efficient but whatever.
  for (const [, value] of Object.entries(bangs)) {
    if (typeof value === 'string') {
      // The value is a string so it's old and needs converting.
      bangs = convertLegacyBangs(bangs);
    }
    break;
  }

  return bangs;
}

/**
 * Creates native pop-up for user to download their bangs as a JSON file.
 */
export async function exportBangs(): Promise<void> {
  const bangs = await getBangs();
  const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(bangs))}`;
  // React probably doesn't like this 😬
  const a = document.createElement('a');
  a.setAttribute('href', dataStr);
  a.setAttribute('download', 'custombangs.json');
  a.click(); // Blocks until user performs action.
  a.remove();
}
