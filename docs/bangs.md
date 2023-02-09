# Bangs / Settings Storage, Usage, Design, and Versions

This outlines how the bangs are stored, how they are represented within the code, and the versions that can exist.

This is a suprisingly important part of the project, as the structure defines how easy it is to lookup bangs, how they are used in the options UI React code, how to update them, how they are stored, etc.

Version 1 and 2 tried to keep one copy of the settings / bangs as a "single source of truth" and pass it around to everything, but this turns out to be a bad idea.

Version 3 is the latest, and is an attempt to de-couple these different use cases.

## Version 1

### Interface

```ts
interface BangsV1 {
  [key: string]: string;
}
```

### Stored JSON Example

```json
{
  "a": "https://smile.amazon.co.uk/s?k=%s"
}
```

## Version 2

### Reason For Update

The Options UI (written in React) needed to save the position of the bangs in the UI, and also needed to be able to reference bangs using something unique, i.e. the `id`.

### Interface

```ts
interface BangsV2Info {
  id: string;
  url: string;
  pos: number;
}

interface BangsV2 {
  [key: string]: BangsV2Info;
}
```

### Stored JSON Example

```json
{
  "a": {
    "id": "BOqjlStMAY",
    "url": "https://smile.amazon.co.uk/s?k=%s",
    "pos": 1
  }
}
```

## Version 3 (WIP)

### Reason For Update

The usage of V2 inside the options UI has been difficult and prevented clean and reasonable code, especially as this interface has been used both for storing the bangs, as well as the representation of the bangs inside the React UI code.

This multiple usage of the same structure has introduced annoying bugs including not being able to have the same text in any of the bang input boxes, making it difficult for users to write/rename bangs before saving (as object keys can't be the same).

This update intends to de-couple the bangs storage/settings, from the interface that React uses for the UI, and from the interface used to lookup up when request redirection occurs.

This does mean that the extension will use slightly more memory (e.g. to store multiple copies of the bangs), but I think this is an acceptable trade for a better development experience.

These interface conversions need to be able to happen:

- settings -> react interface
- settings -> lookup table
- react interface -> settings when options are updated
- react interface -> lookup table when options are updated (this could be done using settings -> lookup table)

There also needs to be a clear way to convert v1 to v2 and v2 to v3 settings, to not cause annoyance to users.

### Settings Interface

TODO:

```ts
interface StoredBang {
  id: string      // A unique ID
  bang: string    // The actual bang
  urls: string[]  // The URLs to redirect to / open
  pos: number     // Position in settings GUI
}

interface Settings {
  version: number,  // 3
  options: {
    ignoreDomains: string[] // search engine URLs to ignore - e.g. searx.tiekoetter.com
    sync: {
      type: string  // e.g. "browser"
      url: string   // if type is "server", this can be the server URL
      key: string   // if type is "server", this can be secret API key
    }
  },
  bangs: StoredBang[]
}
```

### React Interface

TODO:

```ts
interface BangsReact {}
```

### Lookup Interface

```ts
interface BangsLookup {
  [key: string]: string[];
}
```

To be accessed using `lookup[bangString]` where the value is the bang URL(s).

### Stored Settings JSON Example

```json
{
  "version": 3,
  "options": {
    "ignoreDomains": [],
    "sync": {
      "type": "browser",
      "url": "",
      "key": ""
    }
  },
  "bangs": [
    {
      "id": "BOqjlStMAY",
      "bangs": "a",
      "urls": [
        "https://smile.amazon.co.uk/s?k=%s"
      ],
      "pos": 1
    },
    {
      "id": "BOqjlStMAZ",
      "bangs": "ae",
      "urls": [
        "https://smile.amazon.co.uk/s?k=%s",
        "https://www.ebay.co.uk/sch/i.html?_nkw=%s"
      ],
      "pos": 2
    }
  ]
}
```

For now, this settings JSON should be stored in a [single `storage.sync` item](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/sync#storage_quotas_for_sync_data), maybe JSON.stringify'd, and then maybe compressed using [lz-string](https://pieroxy.net/blog/pages/lz-string/index.html).

The storage should be wrapped in a basic API so in the future either [chrome-storage-largeSync](https://github.com/dtuit/chrome-storage-largeSync) or a custom solution using a similar method can be dropped in to the current system without disrupting things.
