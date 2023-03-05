import { WebRequest } from 'webextension-polyfill';

import { getBangsLookup } from './lookup';

const possibleQueryParams = ['q', 'query', 'eingabe'];

export function shouldReject(blacklist: Readonly<string[]>, url: string): boolean {
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
 * Given a URL, construct the associated redirects (or not).
 * @param reqUrl The URL the user requested.
 * @param request (Optional) The request details object from a WebRequestBlocking event.
 * @returns A list of redirections to issue.
 */
export function getRedirects(
  reqUrl: string,
  request: WebRequest.OnBeforeRequestDetailsType | undefined = undefined,
): string[] {
  const url = new URL(reqUrl);
  let queryText = '';

  // request will only be defined by the Firefox processor.
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
    return [];
  }

  // Cut first bang from query text, it can be anywhere in the string.
  let bang = '';
  queryText = queryText.replace(/(^!\S+ | !\S+|^!\S+$)/, (match): string => {
    bang = match.trim().replace('!', '');
    // Replace bang with zero len str.
    return '';
  });

  if (bang.length === 0) {
    return [];
  }

  // Get the chosen URLs from the bang.
  const lookup = getBangsLookup();
  const redirectionUrls = lookup[bang];
  if (redirectionUrls === undefined || redirectionUrls.length === 0) {
    return [];
  }

  // Construct the URL(s) to redirect the user to.
  const redirects = [];
  for (const redirectionUrl of redirectionUrls) {
    redirects.push(constructRedirect(redirectionUrl, queryText));
  }

  return redirects;
}
