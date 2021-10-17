import browser from 'webextension-polyfill';
import React from 'react';
import { nanoid } from 'nanoid';

const defaultJsonFilePath = '../../defaults.json';

export interface BangInfoType {
  id: string;
  url: string;
  pos: number;
}

export interface BangsType {
  [key: string]: BangInfoType;
}

export interface BangsTypeOld {
  [key: string]: string;
}

export type SetBangsType = React.Dispatch<React.SetStateAction<BangsType>>;

function isKeyedObj(arg: any): arg is object {
  return arg !== undefined && arg !== null && typeof arg === 'object' && Object.keys(arg).length > 0;
}

/**
 * A user-defined type guard that tries to determine if arg is of BangsType.
 */
export function isBangsType(arg: any): arg is BangsType {
  if (!isKeyedObj(arg)) {
    return false;
  }
  for (const [key, value] of Object.entries(arg)) {
    if (typeof key !== 'string') {
      return false;
    }
    if (isKeyedObj(value)) {
      if (!('id' in value) || !('url' in value) || !('pos' in value)) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}

/**
 * Converts a file (from an input element) to a BangsType, or null.
 */
export async function tryFileToBangs(file: File): Promise<BangsType | null> {
  if (file.type !== 'application/json') {
    return null;
  }

  let obj = {};
  try {
    obj = JSON.parse(await file.text());
  } catch (e) {
    return null;
  }

  if (!isBangsType(obj)) {
    return null;
  }
  return obj;
}

/**
 * Generates a new uniqe bang ID.
 */
export function newBangId(): string {
  return nanoid(10);
}

/**
 * Convert old bangs to new bangs.
 */
export function convertLegacyBangs(oldBangs: BangsTypeOld): BangsType {
  const newBangs: BangsType = {};
  let i = 1;
  for (const [bang, url] of Object.entries(oldBangs)) {
    newBangs[bang] = {
      id: newBangId(),
      url,
      pos: i,
    };
    i++;
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
