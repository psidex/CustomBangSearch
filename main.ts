import browser, { WebRequest } from 'webextension-polyfill';
import { saveBangs, getBangs, getDefaultBangs } from './options/lib/bangs';

/**
 * Returns the search query from the given search url (must use the q param).
 * If there is no query, returns an empty string.
 */
function queryFromSearchUrl(urlString: string): string {
  const query = (new URLSearchParams(urlString)).get('q');
  if (query === null) { return ''; }
  return query;
}

/**
 * Construct a URL to send the user to given the user written bang URL and query.
 */
function constructRedirect(bangUrl: string, query: string): string {
  // Encodes the query and then replace all "%s" in the bang with the query.
  // encodeURIComponent ensures that symbols (e.g. +:/) get encoded (so when the user
  // goes to where they're going the symbols aren't treated as part of the actual URL)
  return bangUrl.replace(/%s/g, encodeURIComponent(query));
}

/**
 * Takes request details from an onBeforeRequest event and send user to chosen bang.
 */
async function processRequest(r: WebRequest.OnBeforeRequestDetailsType): Promise<WebRequest.BlockingResponse> {
  let query = queryFromSearchUrl(r.url);

  if (query !== '' && query.startsWith('!')) {
    // Remove the first character (the !).
    query = query.substr(1);

    const firstSpaceIndex = query.indexOf(' ');

    // Get everything before the first space, which should be our bang.
    const bang = query.substring(0, firstSpaceIndex);

    const bangs = await getBangs();
    const bangObj = bangs[bang];
    if (bangObj === undefined) {
      return {};
    }

    // Get everything after the first space, i.e. our search.
    query = query.substr(firstSpaceIndex + 1);

    // Users can use a " :: " to chain URLs.
    if (bangObj.url.includes(' :: ')) {
      const bangUrls = bangObj.url.split(' :: ');
      // Open all URLs in new tab and then redirect the current tab to the first in the array.
      for (let i = 1; i < bangUrls.length; i++) {
        browser.tabs.create({ url: constructRedirect(bangUrls[i], query) });
      }
      return {
        redirectUrl: constructRedirect(bangUrls[0], query),
      };
    }

    // Otherwise it's just one URL so redirect there.
    return {
      redirectUrl: constructRedirect(bangObj.url, query),
    };
  }

  // Do nothing.
  return {};
}

/**
 * Checks for saved data and if not found, sets it to the defaults.
 */
async function setDefaultsIfNoneSaved(): Promise<void> {
  const { bangs } = await browser.storage.sync.get('bangs');
  if (bangs === undefined) {
    const defaultBangs = await getDefaultBangs();
    saveBangs(defaultBangs);
  }
}

function main(): void {
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

  // Make sure we have some save data.
  browser.runtime.onInstalled.addListener(setDefaultsIfNoneSaved);
  browser.runtime.onStartup.addListener(setDefaultsIfNoneSaved);
}

main();
