// Define Settings interface(s) here so everyone can use them.

export interface StoredBang {
  // A unique ID
  id: string
  // The actual bang
  bang: string
  // The URLs to redirect to / open
  urls: string[]
  // Position in settings GUI
  pos: number
}

export interface Settings {
  version: number,
  options: {
    // search engine URLs to ignore - e.g. searx.tiekoetter.com
    ignoreDomains: string[]
    sync: {
      // e.g. "browser"
      type: string
      // if type is "server", this can be the server URL
      url: string
      // if type is "server", this can be secret API key
      key: string
    }
  },
  bangs: StoredBang[]
}
