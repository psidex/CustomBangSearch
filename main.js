// Returns the search query from the given Google search url. If there is no query, returns an
// empty string. Also changes all occurrences of '+' with ' '.
function queryFromSearchUrl(url) {
    if (url.indexOf('&q=') === -1) {
        return '';
    }
    // Removes the &q= from the string.
    let query = url.substr(url.indexOf('&q=') + 3);
    // Google uses '+' to separate words, replace with ' '.
    query = query.replace(/\+/g, ' ');

    if (query.indexOf('&') !== -1) {
        // Remove any extra params after the query.
        return query.substr(0, query.indexOf('&'));
    }
    return query;
}

// Processes a request event from onBeforeRequest.
async function processRequest(r) {
    let query = queryFromSearchUrl(decodeURI(r.url));

    if (query !== '' && query.startsWith('!')) {
        query = query.substr(1); // Removes the first character (the !).
        const spaceIndex = query.indexOf(' ');
        const key = query.substring(0, spaceIndex);
        const { bangs } = await browser.storage.sync.get('bangs');

        // If there is no query or wrong key nothing happens e.g. '!m' or '!not-a-key'.
        if (!(key in bangs)) {
            return {};
        }

        // For '!m test', this would give you 'test'.
        query = query.substr(spaceIndex + 1);
        return {
            redirectUrl: bangs[key].replace(/%s/g, query),
        };
    }

    return {};
}

// Checks for saved data and if not found, sets it to the defaults.
async function setDefaultsIfNoneSaved() {
    // Test if we have saved settings, if not, save the default ones.
    let { bangs } = await browser.storage.sync.get('bangs');
    if (bangs === undefined) {
        const r = await fetch('defaults.json');
        bangs = await r.json();
        await browser.storage.sync.set({ bangs });
    }
}

browser.webRequest.onBeforeRequest.addListener(
    processRequest,
    {
        urls: [
            '*://*.google.com/*',
            '*://*.bing.com/*',
            '*://*.duckduckgo.com/*',
        ],
    },
    ['blocking'],
);

// Make sure we have some save data.
browser.runtime.onInstalled.addListener(setDefaultsIfNoneSaved);
browser.runtime.onStartup.addListener(setDefaultsIfNoneSaved);
