import browser from 'webextension-polyfill';

import {
  dev, currentBrowser, version, hash, searchEngineUrls,
} from '../lib/esbuilddefinitions';
import chromeProcessRequest from './chrome';
import firefoxProcessRequest from './firefox';
import { Settings } from '../lib/settings';
import { getSettings, setSettings, loadSettingsIfExists } from './settings';
import { IecMessage, IecMessageType } from '../lib/iec';

// TODO: Update extension icon to be chunkier at least, then get proper sized versions of it

function setEventListeners() {
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
      const msg: IecMessage = {
        type: IecMessageType.SettingsGetResponse,
        data: getSettings(),
        error: false,
      };
      return Promise.resolve(msg);
    }

    if (request.type === IecMessageType.SettingsSet) {
      const newSettings = <Settings> request.data;
      await setSettings(newSettings);
    }

    return Promise.resolve({
      type: IecMessageType.Ok,
      data: null,
      error: false,
    });
  });
}

function main() {
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
