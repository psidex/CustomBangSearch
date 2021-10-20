import browser, { WebRequest } from 'webextension-polyfill';
import {
  saveBangs, getBangs, getDefaultBangs, BangsType, isBangsType,
} from '../lib/bangs';

// NOTE: Chrome doesn't allow us to use an async function for an onBeforeRequest
//  which means we cant call getBangs during. To solve this we save a cache here and
//  then occasionally update it.
let bangsCached: BangsType = {};

/**
 * Returns the search query text from the given search url, remove the '!'.
 * The passed URL must use the q param.
 * If there is no query or it is invalid, returns an empty string.
 * e.g. ('!m new york') => {'m new york'}
 */
function queryFromSearchUrl(urlString: string): string {
  const query = (new URL(urlString)).searchParams.get('q')?.trim();
  if (query === undefined || query === null || !query.startsWith('!')) {
    return '';
  }
  // substr(1) removes the first character, the '!'.
  return query.substr(1);
}

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
  const query = queryFromSearchUrl(r.url);

  if (query === '') {
    // Do nothing.
    return {};
  }

  let bang: string;
  let queryText: string;

  if (query.includes(' ')) {
    const firstSpaceIndex = query.indexOf(' ');
    bang = query.substring(0, firstSpaceIndex);
    queryText = query.substr(firstSpaceIndex + 1).trim();
  } else {
    bang = query;
    queryText = '';
  }

  const bangObj = bangsCached[bang];
  if (bangObj === undefined || bangObj.url.trim() === '') {
    return {};
  }

  // Users can use a " :: " to chain URLs.
  if (bangObj.url.includes(' :: ')) {
    const bangUrls = bangObj.url.split(' :: ');
    // Open all URLs in new tab and then redirect the current tab to the first in the array.
    for (let i = 1; i < bangUrls.length; i++) {
      browser.tabs.create({ url: constructRedirect(bangUrls[i], queryText) });
    }
    return {
      redirectUrl: constructRedirect(bangUrls[0], queryText),
    };
  }

  // Otherwise it's just one URL so redirect there.
  return {
    redirectUrl: constructRedirect(bangObj.url, queryText),
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
