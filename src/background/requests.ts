import browser, {WebRequest} from 'webextension-polyfill';

import {getBangsLookup} from './lookup';
import {getIgnoredDomains} from './ignoreddomains';

const possibleQueryParams = ['q', 'query', 'eingabe'];

// Should this URL be rejected provided the given blacklist?
function shouldReject(blacklist: Readonly<string[]>, url: string): boolean {
  if (blacklist.includes(new URL(url).hostname)) {
    return true;
  }
  return false;
}

// Construct a URL to send the user to given the bang URL and query text.
function constructRedirect(redirectUrl: string, queryText: string): string {
  if (queryText === '') {
    return (new URL(redirectUrl)).origin;
  }
  return redirectUrl.replace(/%s/g, encodeURIComponent(queryText));
}

/**
 * Replace the first non ascii exclamation mark with the ascii exclamation mark.
 * @param queryText may be something like: `！g rust` (there is a Chinese exclamation mark `！` in it)
 * @returns         may be something like: `!g rust`
 *                  (the non ascii exclamation mark `！` has been replaced with the normal ascii exclamation mark `!`)
 */
function replaceFirstNonAsciiExclamationMark(queryText: string) {
  const nonAsciiExclamationMarks = [
    "！", // Chinese exclamation mark
  ]
  for (let nonAsciiExclamationMark of nonAsciiExclamationMarks) {
    if (queryText.indexOf(nonAsciiExclamationMark) > -1) {
      return queryText.replace(nonAsciiExclamationMark, "!")
    }
  }
  return queryText;
}

/**
 * Given a URL, construct the associated redirects (or not).
 * @param reqUrl The URL the user requested.
 * @param request (Optional) The request details object from a WebRequestBlocking event.
 * @returns A list of redirections to issue.
 */
async function getRedirects(
  reqUrl: string,
  request: WebRequest.OnBeforeRequestDetailsType | undefined = undefined,
): Promise<string[]> {
  const url = new URL(reqUrl);
  let queryText = '';

  // Startpage and searx.be send POST request so extract the query from the formdata.
  // Else try to get the query parameter from the URL.

  if (request !== undefined && request.method === 'POST') {
    if (url.hostname.match(/^(.*\.)?startpage.com/gi)) {
      queryText = request.requestBody?.formData?.query?.[0] ?? '';
    } else if (url.hostname.match(/^(.*\/\/)?searx.be/gi)) {
      queryText = request.requestBody?.formData?.q?.[0] ?? '';
    }
  } else {
    for (const param of possibleQueryParams) {
      const queryFromParam = url.searchParams.get(param);
      if (queryFromParam !== null) {
        queryText = queryFromParam;
        break;
      }
    }
  }

  queryText = queryText.trim();

  if (queryText.length === 0) {
    return Promise.resolve([]);
  }

  queryText = replaceFirstNonAsciiExclamationMark(queryText);

  // Cut first bang from query text, it can be anywhere in the string.
  let bang = '';
  queryText = queryText.replace(/(^!\S+ | !\S+|^!\S+$)/, (match): string => {
    bang = match.trim().replace('!', '');
    // Replace bang with zero len str.
    return '';
  });

  if (bang.length === 0) {
    return Promise.resolve([]);
  }

  // Get the chosen URLs from the bang.
  const lookup = await getBangsLookup();
  const redirectionUrls = lookup[bang];
  if (redirectionUrls === undefined || redirectionUrls.length === 0) {
    return Promise.resolve([]);
  }

  // Construct the URL(s) to redirect the user to.
  const redirects = [];
  for (const redirectionUrl of redirectionUrls) {
    redirects.push(constructRedirect(redirectionUrl, queryText));
  }

  return Promise.resolve(redirects);
}

export default async function processRequest(
  r: WebRequest.OnBeforeRequestDetailsType,
): Promise<void> {
  if (r.type !== 'main_frame') {
    return Promise.resolve();
  }

  if (shouldReject(await getIgnoredDomains(), r.url)) {
    return Promise.resolve();
  }

  // From the current URL, get the redirections (if any) to apply.
  const redirections = await getRedirects(r.url, r);

  if (redirections.length === 0) {
    return Promise.resolve();
  }

  // Open all URLs (except the first) in new tabs
  for (let i = 1; i < redirections.length; i += 1) {
    browser.tabs.create({url: redirections[i]});
  }

  // Finally send the current tab to the first in the array.
  browser.tabs.update(r.tabId, {url: redirections[0]});

  return Promise.resolve();
}
