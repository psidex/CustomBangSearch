import browser from 'webextension-polyfill';
import lz from 'lz-string';

import defaultSettings from '../lib/settings.default.json';
import { Settings } from '../lib/settings';

// A lookup table for { bang : [redirect urls] }.
export type BangsLookup = { [key: string]: string[] };

type SettingsV2 = {
  [key: string]: {
    id: string;
    url: string;
    pos: number;
  };
};

type SettingsV1 = {
  [key: string]: string;
};

const setSettingsSyncErr = new Error('Failed to save settings to browers sync storage');

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

function setBangsLookup(obj: Settings): void {
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
    const toStore = lz.compressToUTF16(JSON.stringify(settings));
    // TODO: Error if too big to store? Or maybe settings page deals with that directly.
    return browser.storage.sync.set({ settings: toStore });
  }

  // Error return type - https://stackoverflow.com/a/50071254/6396652.
  return Promise.reject(setSettingsSyncErr);
}

function isKeyedObj(arg: any): arg is object {
  return arg !== undefined && arg !== null && typeof arg === 'object' && Object.keys(arg).length > 0;
}

function isSettingsV1(arg: any): arg is SettingsV1 {
  // Basically, is it a object of type string:string.
  if (!isKeyedObj(arg)) {
    return false;
  }
  for (const [key, value] of Object.entries(arg)) {
    if (typeof key !== 'string') {
      return false;
    }
    if (typeof value !== 'string') {
      return false;
    }
  }
  return true;
}

function isSettingsV2(arg: any): arg is SettingsV2 {
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

function deepCopyObj(obj: object) {
  // Doesn't work with complex types.
  return JSON.parse(JSON.stringify(obj));
}

function convertSettingsV1ToV3(legacySettings: SettingsV1): Settings {
  const newSettings: Settings = deepCopyObj(defaultSettings);
  newSettings.bangs = [];
  for (const [bang, url] of Object.entries(legacySettings)) {
    newSettings.bangs.push({
      bang,
      urls: url.split(' :: '),
    });
  }
  return newSettings;
}

function convertSettingsV2ToV3(legacySettings: SettingsV2): Settings {
  const newSettings: Settings = deepCopyObj(defaultSettings);
  newSettings.bangs = [];
  for (const [bang, val] of Object.entries(legacySettings)) {
    // Generate new ID just because there's no reason not to for now.
    newSettings.bangs.push({
      bang,
      urls: val.url.split(' :: '),
    });
  }
  return newSettings;
}

export async function loadSettingsIfExists(): Promise<void> {
  const { settings: storedSettings, bangs: legacySettings } = await browser.storage.sync.get(['settings', 'bangs']);

  // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#definite-assignment-assertions
  // "A variable is assigned for all intents and purposes, even if TS analyses cannot detect so"
  let settingsToSet!: Settings;

  let haveConvertedLegacy = false;

  if (storedSettings !== undefined && typeof storedSettings === 'string') {
    const decompressed = lz.decompressFromUTF16(storedSettings);
    if (decompressed !== null) {
      settingsToSet = JSON.parse(decompressed);
    }
  } else if (legacySettings !== undefined) {
    if (isSettingsV1(legacySettings)) {
      settingsToSet = convertSettingsV1ToV3(legacySettings);
      haveConvertedLegacy = true;
    } else if (isSettingsV2(legacySettings)) {
      settingsToSet = convertSettingsV2ToV3(legacySettings);
      haveConvertedLegacy = true;
    }
  }

  // We don't need to check the version number yet, because V3 is the first to have one.

  if (settingsToSet !== undefined) {
    try {
      await setSettings(settingsToSet, haveConvertedLegacy);
      if (legacySettings !== undefined) {
        await browser.storage.sync.remove(['bangs']);
      }
    } catch (err) {
      // just use defaults for now...
    }
  }
  // else, we couldn't load any settings, leave it set to the default values.

  return Promise.resolve();
}
