import browser from "webextension-polyfill";

import type { Options } from "../lib/config/config";
import defaultConfig from "../lib/config/default";

//
// Flow:
// - User presses save button in config edit UI
// - The main.ts sync storage change event listener fires, calls updateGlobals
// - updateGlobals calls setLocalOpts
// - Later on, processRequest is called and calls getLocalOpts
//

// New ideas:
// - Similar, but allow storing the same as sync in local if we have unlimited storage
// - What happens if the sync storage is updated externally

export function setLocalOpts(o: Options): void {
	browser.storage.local.set({ localOpts: o });
}

export async function getLocalOpts(): Promise<Readonly<Options>> {
	const { localOpts } = await browser.storage.local.get({
		// Default to default options.
		localOpts: defaultConfig.options,
	});
	return Promise.resolve(localOpts as Options);
}
