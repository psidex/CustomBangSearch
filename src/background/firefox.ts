import browser, { WebRequest } from 'webextension-polyfill';

import { getIgnoredDomains } from './ignoreddomains';
import { getRedirects, shouldReject } from './shared';

export default async function processRequest(
  r: WebRequest.OnBeforeRequestDetailsType,
): Promise<WebRequest.BlockingResponse> {
  if (r.type !== 'main_frame') {
    return Promise.resolve({});
  }

  if (shouldReject(await getIgnoredDomains(), r.url)) {
    return Promise.resolve({});
  }

  // From the current URL, get the redirections (if any) to apply.
  const redirections = await getRedirects(r.url, r);

  if (redirections.length === 0) {
    return Promise.resolve({});
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

  return Promise.resolve(res);
}
