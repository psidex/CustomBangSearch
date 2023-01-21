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
    return (new URL(bangUrl)).origin;
  }
  return bangUrl.replace(/%s/g, encodeURIComponent(queryText));
}

/**
 * Takes request details from an onBeforeRequest event and send user to chosen bang.
 */
function processRequest(r: WebRequest.OnBeforeRequestDetailsType): WebRequest.BlockingResponse {
  if (r.type !== 'main_frame') {
    return {};
  }

  // Get query text or empty string
  const url = new URL(r.url);
  let queryParam = url.searchParams.get('q');
  if (queryParam === null) {
    queryParam = url.searchParams.get('query');
  }
  if (queryParam === null) {
    queryParam = url.searchParams.get('eingabe');
  }
  let queryText = queryParam?.trim() ?? '';

  // Startpage and searx.be use a POST request so extract the query from the formdata
  if (url.hostname.match(/^(.*\.)?startpage.com/gi)) {
    if (r.method === 'POST') {
      queryText = r.requestBody?.formData?.query?.[0].trim() ?? '';
    } else if (r.method === 'GET') {
      queryText = url.searchParams.get('query')?.trim() ?? '';
    }
  }
  if (url.hostname.match(/^(.*\/\/)?searx.be/gi)) {
    if (r.method === 'POST') {
      queryText = r.requestBody?.formData?.q?.[0].trim() ?? '';
    } else if (r.method === 'GET') {
      queryText = url.searchParams.get('q')?.trim() ?? '';
    }
  }

  if (!queryText) { return {}; }

  // Cut first bang from query text, it can be anywhere in the string
  let bang = '';
  queryText = queryText.replace(/(^!\S+ | !\S+|^!\S+$)/, (match): string => {
    bang = match.trim().replace('!', '');
    return '';
  });

  if (!bang) { return {}; }

  const bangObj = bangsCached[bang];
  if (bangObj === undefined || bangObj.url.trim() === '') {
    return {};
  }

  // Users can use a " :: " to chain URLs.
  const bangUrls = bangObj.url.split(' :: ');

  // Open all except the first URLs in new tabs
  for (let i = 1; i < bangUrls.length; i++) {
    browser.tabs.create({ url: constructRedirect(bangUrls[i], queryText) });
  }

  // Finally redirect the current tab to the first in the array.
  let res: WebRequest.BlockingResponse;

  if (r.method === 'GET') {
    res = { redirectUrl: constructRedirect(bangUrls[0], queryText) };
  } else {
    // If we're handling a POST request, we need to tell the tab where to go,
    // as redirecting the POST would not change the tabs location.
    browser.tabs.update(r.tabId, { url: constructRedirect(bangUrls[0], queryText) });
    res = { cancel: true };
  }

  return res;
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

  // requestBody is required to see the startpage POST request data.
  browser.webRequest.onBeforeRequest.addListener(
    processRequest,
    {
      urls: [
        '*://*.google.com/*',
        '*://*.bing.com/*',
        '*://*.duckduckgo.com/*',
        '*://*.qwant.com/*',
        '*://*.startpage.com/*',
        '*://*.ecosia.org/*',
        '*://*.brave.com/*',
        '*://*.metager.org/*',
        '*://*.mojeek.com/*',
        '*://searx.tiekoetter.com/*',
        '*://searx.be/*',
      ],
    },
    ['blocking', 'requestBody'],
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
