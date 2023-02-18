// Define Settings type(s) here so all files can use them.

// Should always be a whole number.
export const currentSettingsVersion: number = 3;

export type StoredBangInfo = {
  // The actual bang.
  bang: string
  // The URLs to redirect to / open.
  urls: string[]
};

export type Settings = {
  version: number,
  options: {
    // Search engine URLs to ignore, e.g. searx.tiekoetter.com.
    ignoreDomains: string[]
    sync: {
      // For now, only "browser" is supported.
      type: string
      // If type is "server", this can be the server URL.
      url: string
      // If type is "server", this can be secret API key.
      key: string
    }
  },
  bangs: StoredBangInfo[]
};
