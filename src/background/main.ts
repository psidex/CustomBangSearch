import browser from 'webextension-polyfill';

import {
  dev, currentBrowser, version, hash, hostPermissions,
} from '../lib/esbuilddefinitions';
import { processRequest } from './requests';
import { Settings } from '../lib/settings';
import * as storage from '../lib/storage';
import { setBangsLookup } from './lookup';
import { setLocalOpts } from './localoptions';
import defaultSettings from '../lib/settings.default.json';
import devLog from '../lib/misc';

function updateGlobals(settings: Settings): void {
  setBangsLookup(settings.bangs);
  setLocalOpts(settings.options);
}

async function setupSettings(): Promise<void> {
  let currentSettings = await storage.getSettings();

  if (currentSettings === undefined) {
    currentSettings = defaultSettings;
  }

  if (currentSettings.version === 3) {
    // TODO: A more elegant way of detecting and converting settings.
    currentSettings.version = 4;
    currentSettings.options.ignoreCase = false;
  }

  updateGlobals(currentSettings);

  // Redundant if the user just has settings set. Only happens once per load tho, not a problem.
  return storage.storeSettings(currentSettings);
}

function main(): void {
  devLog(`Dev: ${dev}, Browser: ${currentBrowser}, Version: ${version}, Hash: ${hash}`);

  // Because service workers need to set their event listeners immediately, we can't await this.
  // FIXME: There may be a better way to do this, but for now we just hope it runs quickly!
  setupSettings();

  browser.storage.sync.onChanged.addListener((changes: { settings?: { newValue: string } }) => {
    if (changes.settings !== undefined) {
      const newSettings = storage.decompressSettings(changes.settings.newValue);
      if (newSettings !== null) {
        updateGlobals(newSettings);
      }
    }
  });

  // The requestBody opt is required for handling POST situations.
  const extraInfoSpec: browser.WebRequest.OnBeforeRequestOptions[] = ['requestBody'];

  // Wrap processRequest because the types don't like an async non-blocking handler.
  let webRequestHandler = (r: browser.WebRequest.OnBeforeRequestDetailsType) => {
    processRequest(r);
  };

  if (currentBrowser === 'firefox') {
    devLog('Enabling blocking webRequest listener');
    // Add blocking spec and unwrap processRequest as it may return a blocking response.
    extraInfoSpec.push('blocking');
    webRequestHandler = processRequest;
  }

  browser.webRequest.onBeforeRequest.addListener(
    webRequestHandler,
    { urls: hostPermissions },
    extraInfoSpec,
  );
}

main();
