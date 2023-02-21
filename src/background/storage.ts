import browser from 'webextension-polyfill';
import lz from 'lz-string';

import { Settings } from '../lib/settings';
import { dev } from '../lib/esbuilddefinitions';

// TODO: If using browser sync, have option to use localstorage as backup / cache
// TODO: "removeSettings" to delete when switching storage type

const supportedStorageTypes = new Set(['browser']);

function compressSettings(toCompress: Settings): string {
  return lz.compressToUTF16(JSON.stringify(toCompress));
}

function decompressSettings(toDecompress: string): Settings {
  const decompressed = lz.decompressFromUTF16(toDecompress);
  // FIXME: Throw error if decompressed is null?
  return JSON.parse(decompressed as string);
}

function getStorageApi(storageType: string): Promise<browser.Storage.SyncStorageAreaSync> {
  if (!supportedStorageTypes.has(storageType)) {
    return Promise.reject(new Error('unsupported storage type'));
  }

  // TODO: Add support to save to & load from local and custom server (not a priority)

  // if (storageType === 'local') {
  //   api = browser.storage.local;
  // }

  return Promise.resolve(browser.storage.sync);
}

export async function storeSettings(toStore: Settings, storageType: string): Promise<void> {
  const storageApi = await getStorageApi(storageType);
  // TODO: Error if compressedSettings too big to store, work out how to calc for each storage type.
  const compressedSettings = compressSettings(toStore);
  return storageApi.set({ settings: compressedSettings });
}

export async function loadSettings(storageType: string): Promise<Settings | undefined> {
  const storageApi = await getStorageApi(storageType);
  const { settings: storedSettingsStr } = await storageApi.get(['settings']);
  if (storedSettingsStr === undefined) {
    return Promise.resolve(undefined);
  }
  if (dev) {
    // TODO: Remove this?
    // +10 is a guess based on the other part being "settings: ", should check
    // eslint-disable-next-line no-console
    console.log(`Stored bytes should be ${(new TextEncoder().encode(storedSettingsStr)).length + 10}`);
  }
  return Promise.resolve(decompressSettings(storedSettingsStr));
}

export async function loadAndRmLegacySettings(): Promise<any> {
  const { bangs: legacySettings } = await browser.storage.sync.get(['bangs']);
  if (legacySettings !== undefined) {
    await browser.storage.sync.remove(['bangs']);
  }
  return legacySettings;
}
