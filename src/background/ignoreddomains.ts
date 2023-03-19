import browser from 'webextension-polyfill';

export function setIgnoredDomains(arr: string[]): void {
  browser.storage.local.set({ ignoredDomains: arr });
}

export async function getIgnoredDomains(): Promise<Readonly<string[]>> {
  const { ignoredDomains } = await browser.storage.local.get('ignoredDomains');
  return Promise.resolve(ignoredDomains);
}
