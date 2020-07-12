const defaultBangs = {
    a: 'https://smile.amazon.co.uk/s?k=',
    m: 'https://www.google.com/maps/search/',
    t: 'https://www.twitch.tv/search?term=',
    y: 'https://www.youtube.com/results?search_query=',
    g: 'https://www.google.com/search?q=',
    w: 'https://www.wolframalpha.com/input/?i=',
};

// true if object has no keys else false.
function isEmptyObj(obj) {
    return Object.keys(obj).length === 0;
}

// Returns the search query from the given Google search url.
// If there is no query, returns an empty string.
// Also changes all occurrences of '+' with ' '.
function queryFromGoogleUrl(url) {
    if (url.indexOf('&q=') === -1) {
        return '';
    }

    // Removes the &q= from the string.
    let query = url.substr(url.indexOf('&q=') + 3);
    // Google uses '+' to separate words, replace with ' '.
    query = query.replace(/\+/g, ' ');

    if (query.indexOf('&') !== -1) {
        // Remove anything after the query.
        return query.substr(0, query.indexOf('&'));
    }
    return query;
}

// Processes a request event from onBeforeRequest.
async function processRequest(r) {
    let query = queryFromGoogleUrl(decodeURI(r.url));

    if (query !== '' && query.startsWith('!')) {
        let { bangs } = await browser.storage.sync.get("bangs");
        if (isEmptyObj(bangs)) {
            bangs = defaultBangs;
        }

        query = query.substr(1); // Removes the first character (the !).
        const spaceIndex = query.indexOf(' ');
        const key = query.substring(0, spaceIndex);

        // Not in the bangs lookup obj.
        if (!bangs.hasOwnProperty(key)) {
            return {};
        }

        // The substr call removes the !, the key, and the following ' ' from the search
        return {
            redirectUrl: bangs[key] + query.substr(spaceIndex + 1),
        };
    }

    return {};
}

// Start listening!
browser.webRequest.onBeforeRequest.addListener(
    processRequest,
    {
        urls: [
            '*://*.google.com/*',
            '*://*.bing.com/*',
            '*://*.duckduckgo.com/*'
        ],
    },
    ['blocking'],
);
