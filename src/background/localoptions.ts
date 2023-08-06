import browser from 'webextension-polyfill';

import { SettingsOptions } from '../lib/settings';
import defaultSettings from '../lib/settings.default.json';

//
// Options flow:
// - User saves options using the UI (technically saves the Settings)
// - main.ts sync storage change event listener fires, calls updateGlobals
// - updateGlobals calls setLocalOpts
// - Later on, processRequest is called and calls getLocalOpts
//

export function setLocalOpts(o: SettingsOptions): void {
  browser.storage.local.set({ localOpts: o });
}

export async function getLocalOpts(): Promise<Readonly<SettingsOptions>> {
  const { localOpts } = await browser.storage.local.get({
    // Default to default options.
    localOpts: defaultSettings.options,
  });
  return Promise.resolve(localOpts);
}
