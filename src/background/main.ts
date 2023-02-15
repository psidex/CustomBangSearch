import browser from 'webextension-polyfill';

import {
  dev, currentBrowser, version, hash, searchEngineUrls,
} from '../lib/esbuilddefinitions';
import chromeProcessRequest from './chrome';
import firefoxProcessRequest from './firefox';
import { Settings } from '../lib/settings';
import { getSettings, setSettings, loadSettingsIfExists } from './settings';
import { IecMessage, IecMessageType } from '../lib/iec';

// TODO: probably in processors, respect disabled domains from settings.

function setEventListeners(): void {
  if (currentBrowser === 'chrome') {
    // Only fires on tabs where the URL is in host_permissions.
    browser.tabs.onUpdated.addListener((tabId, changed) => {
      if (changed.url !== undefined) {
        chromeProcessRequest(tabId, changed.url);
      }
    });
  } else {
    // The requestBody spec is required for handling POST situations.
    browser.webRequest.onBeforeRequest.addListener(
      firefoxProcessRequest,
      { urls: searchEngineUrls },
      ['blocking', 'requestBody'],
    );
  }

  browser.runtime.onMessage.addListener(async (request: IecMessage): Promise<IecMessage> => {
    if (request.type === IecMessageType.SettingsGet) {
      return Promise.resolve({
        type: IecMessageType.SettingsGetResponse,
        data: getSettings(),
      });
    }

    if (request.type === IecMessageType.SettingsSet) {
      const newSettings = request.data as Settings;
      try {
        await setSettings(newSettings);
      } catch (err) {
        return Promise.resolve({
          type: IecMessageType.Error,
          data: (err as Error).toString(),
        });
      }
    }

    return Promise.resolve({
      type: IecMessageType.Ok,
      data: null,
    });
  });
}

function main(): void {
  if (dev) {
    // eslint-disable-next-line no-console
    console.info(`Dev: ${dev}, Browser: ${currentBrowser}, Version: ${version}, Hash: ${hash}`);
  }

  // Event listeners have to be set synchronously, so we just have to hope that
  // loadSettingsIfExists runs fast. If it doesn't it's not a massive deal, as we will
  // still have the default bangs whilst it's (presumably) fetching stuff from the
  // browsers sync storage.

  loadSettingsIfExists();
  setEventListeners();
}

main();
