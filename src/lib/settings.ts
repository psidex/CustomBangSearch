// Define Settings type(s) here so all files can use them.

// Should always be a whole number.
export const currentSettingsVersion: number = 3;

export type StoredBangInfo = {
  // The actual bang.
  bang: string
  // The URLs to redirect to / open.
  urls: string[]
};

export type SettingsOptions = {
  // Search engine URLs to ignore, e.g. searx.tiekoetter.com.
  ignoredDomains: string[]
};

export type Settings = {
  version: number,
  options: SettingsOptions,
  bangs: StoredBangInfo[]
};
