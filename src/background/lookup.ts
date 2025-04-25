import browser from "webextension-polyfill";

import type { BangInfo } from "../lib/config/config";

//
// TODO: Reword this: NOTE: It is standard behaviour to use local storage to hold
// global state for web extensions
//
// TODO: A better name for this file
//
// TODO: Update comment below
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

const storageLocalKey = "bangInfoLookup";

// TODO: This should also be called when the config is saved in the UI
export async function setBangInfoLookup(bangs: BangInfo[]): Promise<void> {
	const lookup: Record<string, BangInfo> = {};
	for (const bangInfo of bangs) {
		lookup[bangInfo.keyword] = bangInfo;
	}
	return browser.storage.local.set({ [storageLocalKey]: lookup });
}

// Returns alookup table for { bang keyword : BangInfo }
export async function getBangInfoLookup(): Promise<
	Readonly<Record<string, BangInfo>>
> {
	const got = await browser.storage.local.get(storageLocalKey);
	// TODO(future): Should be OK, but should probs null/undefined check
	// bangsLookup, and that it matches the type
	const bangsLookup = got[storageLocalKey];
	return bangsLookup as Record<string, BangInfo>;
}
