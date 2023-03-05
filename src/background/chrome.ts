import browser from 'webextension-polyfill';

import { getIgnoredDomains } from './ignoreddomains';
import { getRedirects, shouldReject } from './shared';

export default function processRequest(tabId: number, url: string): void {
  if (shouldReject(getIgnoredDomains(), url)) {
    return;
  }

  // From the current URL, get the redirections (if any) to apply.
  const redirections = getRedirects(url);

  if (redirections.length === 0) {
    return;
  }

  // Open all URLs (except the first) in new tabs
  for (let i = 1; i < redirections.length; i += 1) {
    browser.tabs.create({ url: redirections[i] });
  }

  // Finally send the current tab to the first in the array.
  browser.tabs.update(tabId, { url: redirections[0] });
}
