// Returns the search query from the given search url (search must use the q param).
// If there is no query, returns an empty string. Also changes all occurrences of '+' to ' '.
function queryFromSearchUrl(urlString) {
  const params = new URLSearchParams(urlString);
  const query = params.get('q');
  if (query === null) {
    return '';
  }
  // Some search engines use '+' to separate words, replace with ' '.
  return query.replace(/\+/g, ' ');
}

// Processes a request event from onBeforeRequest.
async function processRequest(r) {
  let query = queryFromSearchUrl(r.url);

  if (query.startsWith('!')) {
    // Remove the first character (the !).
    query = query.substr(1);

    const firstSpaceIndex = query.indexOf(' ');
    const key = query.substring(0, firstSpaceIndex);

    const { bangs } = await browser.storage.sync.get('bangs');
    const bang = bangs[key];
    if (bang === undefined) {
      return {};
    }

    query = query.substr(firstSpaceIndex + 1);
    return {
      redirectUrl: bang.replace(/%s/g, query),
    };
  }

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
