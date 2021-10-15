import browser, { WebRequest } from 'webextension-polyfill';

// Cleans query string to be used in a redirection.
function cleanQuery(query: string) {
  // Remove the first character (the !).
  const q = query.substr(1);
  // Change all occurrences of '+' to ' ' as some search engines use '+' to separate
  // words and where we're redirecting might not like that, but should support ' '.
  // FIXME: This does mean if someone wants to search for something with '+' in it then
  // we end up replacing it.
  return q.replace(/\+/g, ' ');
}

// Returns the search query from the given search url (must use the q param).
// If there is no query, returns an empty string.
function queryFromSearchUrl(urlString: string) {
  const query = (new URLSearchParams(urlString)).get('q');
  if (query === null) { return ''; }
  return query;
}

// Takes request details from an onBeforeRequest event and send user to chosen bang.
async function processRequest(r: WebRequest.OnBeforeRequestDetailsType) {
  let query = queryFromSearchUrl(r.url);

  if (query.startsWith('!')) {
    query = cleanQuery(query);

    const firstSpaceIndex = query.indexOf(' ');

    // Get everything before the first space, which should be our bang.
    const key = query.substring(0, firstSpaceIndex);

    const { bangs } = await browser.storage.sync.get('bangs');
    const bang = bangs[key];
    if (bang === undefined) {
      return {};
    }

    // Get everything after the first space, i.e. our search.
    query = query.substr(firstSpaceIndex + 1);

    // Replace all "%s" with the found query.
    return {
      redirectUrl: encodeURI(bang.replace(/%s/g, query)),
    };
  }

  // Do nothing.
  return {};
}

// Checks for saved data and if not found, sets it to the defaults.
async function setDefaultsIfNoneSaved() {
  const { bangs } = await browser.storage.sync.get('bangs');
  if (bangs === undefined) {
    const defaultBangs = await (await fetch('defaults.json')).json();
    await browser.storage.sync.set({ bangs: defaultBangs });
  }
}

function main() {
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
