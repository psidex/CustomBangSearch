import defaultSettings from '../lib/settings.default.json';
import { Settings } from '../lib/settings';

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

function deepCopy(obj: any) {
  // obj has to be stringifyable.
  return JSON.parse(JSON.stringify(obj));
}

function isKeyedObj(arg: any): arg is object {
  return arg !== undefined && arg !== null && typeof arg === 'object' && Object.keys(arg).length > 0;
}

export function isSettingsV1(arg: any): arg is SettingsV1 {
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

export function isSettingsV2(arg: any): arg is SettingsV2 {
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

export function convertSettingsV1ToV3(legacySettings: SettingsV1): Settings {
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

export function convertSettingsV2ToV3(legacySettings: SettingsV2): Settings {
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
