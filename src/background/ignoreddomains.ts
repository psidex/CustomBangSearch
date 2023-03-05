// A global single var to hold the current ignored domains object.
let ignoredDomains: string[] = [];

export function setIgnoredDomains(arr: string[]): void {
  ignoredDomains = arr;
}

export function getIgnoredDomains(): Readonly<string[]> {
  return ignoredDomains;
}
