import defaultSettings from '../lib/settings.default.json';
import { Settings } from '../lib/settings';
import * as storage from './storage';

// "set" and "get" tend to refer to the global setting(s) variables.
// "load" and "store" tend to refer to the backend storage of the settings.

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
export async function setSettings(obj: Settings, store = true): Promise<void> {
  settings = obj;
  setBangsLookup(obj);

  if (!store) {
    return Promise.resolve();
  }

  return storage.storeSettings(settings, 'browser');
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

function deepCopy(obj: any) {
  // obj has to be stringifyable.
  return JSON.parse(JSON.stringify(obj));
}

function convertSettingsV1ToV3(legacySettings: SettingsV1): Settings {
  const newSettings: Settings = deepCopy(defaultSettings);
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
  const newSettings: Settings = deepCopy(defaultSettings);
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

export async function tryLoadSettingsFromStorage(): Promise<void> {
  let storedSettings: Settings | undefined;
  try {
    storedSettings = await storage.loadSettings('browser');
  } catch (err) {
    // Can't talk to storage (or wrong storage), just use default for now.
    // FIXME: Specific case for wrong storage, report to user somehow?
    //        Same goes for setSettings err.
    return Promise.resolve();
  }

  let settingsToSet = storedSettings;

  // We want to do this even if we loaded settings, to make sure legacy is deleted.
  const legacySettings = await storage.loadAndRmLegacySettings();
  let haveConvertedLegacy = false;

  // If we found no settings, but we found legacy settings.
  if (storedSettings === undefined && legacySettings !== undefined) {
    if (isSettingsV1(legacySettings)) {
      settingsToSet = convertSettingsV1ToV3(legacySettings);
      haveConvertedLegacy = true;
    } else if (isSettingsV2(legacySettings)) {
      settingsToSet = convertSettingsV2ToV3(legacySettings);
      haveConvertedLegacy = true;
    }
  }

  if (settingsToSet !== undefined) {
    try {
      await setSettings(settingsToSet, haveConvertedLegacy);
    } catch (err) {
      // Can't talk to storage, use default for now.
    }
  }

  return Promise.resolve();
}
