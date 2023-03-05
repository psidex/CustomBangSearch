import browser from 'webextension-polyfill';
import lz from 'lz-string';

import { Settings } from './settings';

// Currently we only support 'browser', but likely will support more in the future.
// Because of this, we have the functionality for more, but hard-code 'browser' for now.
const supportedStorageTypes = new Set(['browser']);

function compressSettings(toCompress: Settings): string {
  return lz.compressToUTF16(JSON.stringify(toCompress));
}

export function decompressSettings(toDecompress: string): Settings | null {
  const decompressed = lz.decompressFromUTF16(toDecompress);
  return JSON.parse(decompressed as string);
}

function getStorageApi(storageType: string): Promise<browser.Storage.SyncStorageAreaSync> {
  if (!supportedStorageTypes.has(storageType)) {
    return Promise.reject(new Error('unsupported storage type'));
  }
  // if (storageType === 'local') {
  //   api = browser.storage.local;
  // }
  // if (storageType === 'server') {
  //   api = some custom implementation
  // }
  return Promise.resolve(browser.storage.sync);
}

export async function storeSettings(toStore: Settings): Promise<void> {
  const storageApi = await getStorageApi('browser');
  const compressedSettings = compressSettings(toStore);
  // If compressedSettings is too big, set will reject with error message to show user.
  return storageApi.set({ settings: compressedSettings });
}

export async function getSettings(): Promise<Settings | undefined> {
  const storageApi = await getStorageApi('browser');
  const { settings: storedSettingsStr } = await storageApi.get(['settings']);
  if (storedSettingsStr === undefined) {
    return Promise.resolve(undefined);
  }
  const decompressed = decompressSettings(storedSettingsStr);
  if (decompressed === null) {
    // TODO: Maybe throw an err or something?
    return Promise.resolve(undefined);
  }
  return Promise.resolve(decompressed);
}

export async function getAndRmLegacySettings(): Promise<any> {
  const { bangs: legacySettings } = await browser.storage.sync.get(['bangs']);
  if (legacySettings !== undefined) {
    await browser.storage.sync.remove(['bangs']);
  }
  return legacySettings;
}
