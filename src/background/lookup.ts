import browser from "webextension-polyfill";

import type * as config from "../lib/config/config";

//
// TODO: Update this comment to be accurate and worded correctly
//
// NOTE: It is standard behaviour to use local storage to hold
// global state for web extensions
//
// Flow:
// - User presses save button in config edit UI
// - The main.ts sync storage change event listener fires, calls updateGlobals
// - updateGlobals calls setLocalOpts
// - Later on, processRequest is called and calls getLocalOpts
//
// Notes:
// - What happens if the sync storage is updated on another instance
//

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
		if (bangInfo.alias !== "") {
			lookup[bangInfo.keyword] = lookup[bangInfo.alias];
		}
	}

	return browser.storage.local.set({ [storageLocalKey]: lookup });
}

// Returns alookup table for { bang keyword : BangInfo }
export async function getBangInfoLookup(): Promise<Readonly<BangsLookup>> {
	const got = await browser.storage.local.get(storageLocalKey);
	// TODO(future): Should be OK, but should probs null/undefined check
	// bangsLookup, and that it matches the type
	const bangsLookup = got[storageLocalKey];
	return bangsLookup as BangsLookup;
}
