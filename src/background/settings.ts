import browser from 'webextension-polyfill';

import defaultSettings from './settings.default.json';
import { Settings } from '../lib/settings';

// A lookup table for { bang : [redirect urls] }.
export interface BangsLookup { [key: string]: string[] }

function bangsLookupFromSettings(s: Settings): BangsLookup {
  const l: BangsLookup = {};
  for (const sb of s.bangs) {
    l[sb.bang] = sb.urls;
  }
  return l;
}

// The single source of truth for settings and the bang/url lookup table.
// Use the getters to get read only versions of the values.
// Use the setters to update the values stored here.
let settings: Settings = defaultSettings;
let bangsLookup: BangsLookup = bangsLookupFromSettings(settings);

export function getBangsLookup(): Readonly<BangsLookup> {
  return bangsLookup;
}

export function getSettings(): Readonly<Settings> {
  return settings;
}

function setBangsLookup(obj: Settings) {
  bangsLookup = bangsLookupFromSettings(obj);
}

// This (&getter) is probably safe, no mutex required - https://stackoverflow.com/a/5347062/6396652
export async function setSettings(obj: Settings, syncSet = true): Promise<void> {
  settings = obj;
  setBangsLookup(obj);

  if (!syncSet) {
    return Promise.resolve();
  }

  if (settings.options.sync.type === 'browser') {
    // TODO: Error if too big to store?
    return browser.storage.sync.set({ settings });
  }

  console.error('settings.options.sync.type must be "browser"');
  // Is this correct usage of reject? and resolve?
  return Promise.reject();
}

export async function loadSettingsIfExists(): Promise<void> {
  const { settings: storedSettings } = await browser.storage.sync.get('settings');
  // TODO: Detect and convert old settings stored under 'bangs' key.
  if (storedSettings !== undefined) {
    return setSettings(storedSettings, false);
  }
  return Promise.resolve();
}
