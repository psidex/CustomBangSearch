import browser from "webextension-polyfill";

import type * as config from "../lib/config/config";

export type BangsLookup = Record<string, config.BangInfo>;

const storageLocalKey = "bangInfoLookup";

export async function setBangInfoLookup(
	bangs: config.BangInfo[],
): Promise<void> {
	const lookup: BangsLookup = {};

	for (const bangInfo of bangs) {
		lookup[bangInfo.keyword] = bangInfo;
	}

	// We do this twice as we need to make sure that the LUT already contains what
	// an alias will be pointing to
	for (const bangInfo of bangs) {
		if (bangInfo.alias !== null && lookup[bangInfo.alias] !== undefined) {
			lookup[bangInfo.keyword] = lookup[bangInfo.alias];
		}
	}

	return browser.storage.local.set({ [storageLocalKey]: lookup });
}

// Returns a lookup table for { bang keyword : BangInfo }
export async function getBangInfoLookup(): Promise<Readonly<BangsLookup>> {
	const got = await browser.storage.local.get(storageLocalKey);
	// TODO(future): Should be OK, but should probs null/undefined check
	// bangsLookup, and that it matches the type
	const bangsLookup = got[storageLocalKey];
	return bangsLookup as BangsLookup;
}
