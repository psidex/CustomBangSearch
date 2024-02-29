// Define Settings type(s) here so all files can use them.

// Should always be a whole number.
export const currentSettingsVersion: number = 5;

export type StoredBangInfo = {
  // The actual bang.
  bang: string
  // The URLs to redirect to / open.
  urls: string[]
};

export type SettingsOptions = {
  // Search engine URLs to ignore, e.g. searx.tiekoetter.com.
  ignoredDomains: string[]
  // If true, ignore bang case.
  ignoreCase: boolean
  // Sort bang list alphabeticaly.
  sortByAlpha: boolean
};

export type Settings = {
  version: number,
  options: SettingsOptions,
  bangs: StoredBangInfo[]
};

// Exports only contain the users bangs, and the current settings version.
export type BangsExport = {
  version: number,
  bangs: StoredBangInfo[]
};
