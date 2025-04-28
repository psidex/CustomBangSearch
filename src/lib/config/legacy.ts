//
// All the necessary code for detecting, getting, and converting old-style "settings" to the new Config type
// It is assumed that no one has settings older than version 5 (I hope)
//

import browser from "webextension-polyfill";
import lz from "lz-string";

import type * as config from "./config";
import defaultConfig from "./default";

// TODO: For debugging, we should maybe have a function that sets an old-style settings?

// Not needed but kept for posterity
// const settingsVersion = 5;

// The updated version of this Is now referred to as "BangInfo"
interface StoredBangInfo {
	bang: string;
	urls: string[];
}

// The updated version of this Is now referred to as "Options"
interface SettingsOptions {
	ignoredDomains: string[];
	ignoreCase: boolean;
	sortByAlpha: boolean;
}

// The updated version of this Is now referred to as "Config"
interface Settings {
	version: number;
	options: SettingsOptions;
	bangs: StoredBangInfo[];
}

// findOldSettings returns a Settings obj if it can be found, otherwise null
async function findOldSettings(): Promise<Settings | null> {
	const { settings: storedSettingsStr } = await browser.storage.sync.get([
		"settings",
	]);
	if (typeof storedSettingsStr !== "string") {
		return null;
	}

	const decompressed: unknown = JSON.parse(
		lz.decompressFromUTF16(storedSettingsStr),
	);
	if (decompressed === null) {
		return null;
	}

	// If there was a string that was lz compressed, it will probably be a valid Settings object
	return Promise.resolve(decompressed as Settings);
}

function convertSettingsToConfig(oldSettings: Settings): config.Config {
	const cfg = defaultConfig;

	cfg.options.ignoredSearchDomains = oldSettings.options.ignoredDomains || [];
	cfg.options.ignoreBangCase = oldSettings.options.ignoreCase || false;

	cfg.bangs = oldSettings.bangs.map(
		(bang): config.BangInfo => ({
			id: crypto.randomUUID(),
			keyword: bang.bang,
			alias: "",
			defaultUrl: "",
			urls: bang.urls
				? bang.urls.map((url) => ({
						id: crypto.randomUUID(),
						url: url,
					}))
				: [],
			dontEncodeQuery: false,
		}),
	);

	return cfg;
}

// CheckForAndConvertOldSettings returns Config or null. If it returns a Config,
// it has found an old Settings object and has converted it to the new style
export default async function CheckForAndConvertOldSettings(): Promise<config.Config | null> {
	const oldSettings = await findOldSettings();
	if (oldSettings === null) {
		return null;
	}
	// TODO: Remove old settings after this, and then return
	return convertSettingsToConfig(oldSettings);
}
