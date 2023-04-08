# Settings Storage, Usage, Design, and Versions

This outlines how the settings / bangs are stored, how they are represented within the code, and the versions that can exist.

This is a surprisingly important part of the project, as the structure defines how easy it is to lookup bangs, how they are used in the options UI React code, how to update them, how they are stored, etc.

Version 1 and 2 tried to keep one copy of the settings / bangs as a "single source of truth" and pass it around to everything, but this turns out to be a bad idea.

Version 3 is the latest, and is an attempt to de-couple these different use cases.

## Version 1

### Type

```ts
type SettingsV1 = {
  [key: string]: string;
};
```

### JSON Example

```json
{
  "a": "https://smile.amazon.co.uk/s?k=%s"
}
```

## Version 2

### Reason For Update

The Options UI (written in React) needed to save the position of the bangs in the UI, and also needed to be able to reference bangs using something unique, i.e. the `id`.

### Type

```ts
type SettingsV2 = {
  [key: string]: {
    id: string;
    url: string;
    pos: number;
  };
};
```

### JSON Example

```json
{
  "a": {
    "id": "BOqjlStMAY",
    "url": "https://smile.amazon.co.uk/s?k=%s",
    "pos": 1
  }
}
```

## Version 3

### Reason For Update

The usage of V2 inside the options UI has been difficult and prevented clean and reasonable code, especially as the V2 type has been used both for storing the bangs, as well as the representation of the bangs inside the React UI code.

This multiple usage of the same structure has introduced annoying bugs including not being able to have the same text in any of the bang input boxes, making it difficult for users to write/rename bangs before saving (as object keys can't be the same).

This update intends to de-couple the storage of the settings from the interface that React uses for the UI, and from the interface used to lookup up when request redirection occurs.

This does mean that the extension will use slightly more resources (e.g. to store multiple copies of the bangs, and to convert between them), but I think this is an acceptable trade for a better development experience.

### Type

```ts
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
```

### JSON Example

```json
{
  "version": 3,
  "options": {
    "ignoredDomains": []
  },
  "bangs": [
    {
      "bang": "a",
      "urls": [
        "https://amazon.co.uk/s?k=%s"
      ]
    },
    {
      "bang": "ea",
      "urls": [
        "https://amazon.co.uk/s?k=%s",
        "https://www.ebay.co.uk/sch/i.html?_nkw=%s"
      ]
    }
  ]
}
```

For now, this settings JSON is stored in a [single `storage.sync` item](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/sync#storage_quotas_for_sync_data), JSON.stringify'd, and then compressed using [lz-string](https://pieroxy.net/blog/pages/lz-string/index.html)
