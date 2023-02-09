import browser, { WebRequest } from 'webextension-polyfill';

import getRedirects from './shared';

export default function processRequest(
  r: WebRequest.OnBeforeRequestDetailsType,
): WebRequest.BlockingResponse {
  if (r.type !== 'main_frame') {
    return {};
  }

  // From the current URL, get the redirections (if any) to apply.
  const redirections = getRedirects(r.url, r);

  if (redirections.length === 0) {
    return {};
  }

  // Open all URLs (except the first) in new tabs
  for (let i = 1; i < redirections.length; i += 1) {
    browser.tabs.create({ url: redirections[i] });
  }

  // Finally redirect the current tab to the first in the array.
  let res: WebRequest.BlockingResponse;

  if (r.method === 'GET') {
    res = { redirectUrl: redirections[0] };
  } else {
    // If we're handling a POST request, we need to tell the tab where to go,
    // as redirecting the POST would not change the tabs location.
    browser.tabs.update(r.tabId, { url: redirections[0] });
    res = { cancel: true };
  }

  return res;
}
