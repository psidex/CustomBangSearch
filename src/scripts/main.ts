import browser, { WebRequest } from 'webextension-polyfill';
import {
  saveBangs, getBangs, getDefaultBangs, BangsType, isBangsType,
} from '../lib/bangs';

// NOTE: Chrome doesn't allow us to use an async function for an onBeforeRequest
//  which means we cant call getBangs during. To solve this we save a cache here and
//  then occasionally update it.
let bangsCached: BangsType = {};

/**
 * Construct a URL to send the user to given the bang URL and query text.
 */
function constructRedirect(bangUrl: string, queryText: string): string {
  if (queryText === '') {
    return bangUrl;
  }
  return bangUrl.replace(/%s/g, encodeURIComponent(queryText));
}

/**
 * Takes request details from an onBeforeRequest event and send user to chosen bang.
 */
function processRequest(r: WebRequest.OnBeforeRequestDetailsType): WebRequest.BlockingResponse {
  // Get query text or empty string
  let queryText = (new URL(r.url)).searchParams.get('q')?.trim() ?? '';
  if (!queryText) { return {}; }

  // Cut first bang from query text
  let bang = '';
  queryText = queryText.replace(/!\w+/, (substr) => {
    bang = substr.substring(1);
    return '';
  });
  if (!bang) { return {}; }

  const bangObj = bangsCached[bang];
  if (bangObj === undefined || bangObj.url.trim() === '') {
    return {};
  }

  // Users can use a " :: " to chain URLs.
  const bangUrls = bangObj.url.split(' :: ');
  // Open following URLs in new tabs and then redirect the current tab to the first in the array.
  for (let i = 1; i < bangUrls.length; i++) {
    browser.tabs.create({ url: constructRedirect(bangUrls[i], queryText) });
  }
  return {
    redirectUrl: constructRedirect(bangUrls[0], queryText),
  };
}

/**
 * Sets our cached data.
 */
function updateCache(newBangs: BangsType): void {
  bangsCached = newBangs;
}

/**
 * Sets our cached data, also checks for saved data and, if not found, sets it to the defaults.
 */
async function updateCacheFromSync(): Promise<void> {
  let bangs = await getBangs();
  if (bangs === undefined) {
    bangs = await getDefaultBangs();
    saveBangs(bangs);
  }
  updateCache(bangs);
}

function main(): void {
  // Make sure we have some save data.
  updateCacheFromSync();
  browser.runtime.onInstalled.addListener(updateCacheFromSync);
  browser.runtime.onStartup.addListener(updateCacheFromSync);

  browser.webRequest.onBeforeRequest.addListener(
    processRequest,
    {
      urls: [
        '*://*.google.com/*',
        '*://*.bing.com/*',
        '*://*.duckduckgo.com/*',
        '*://*.qwant.com/*',
      ],
    },
    ['blocking'],
  );

  // Receive bang updates from the options page.
  browser.runtime.onMessage.addListener(async (request): Promise<void> => {
    const { bangs } = request;
    if (isBangsType(bangs)) {
      // Update browser storage and our cache.
      await saveBangs(bangs);
      updateCache(bangs);
      return Promise.resolve();
    }
    return Promise.reject();
  });
}

main();
