import browser from "webextension-polyfill";

import {
	inDev,
	currentBrowser,
	version,
	hash,
	hostPermissions,
} from "../lib/esbuilddefinitions";
import { processRequest } from "./requests";
import type { Config } from "../lib/config/config";
import * as storage from "../lib/config/storage/storage";
import { setBangsLookup } from "./lookup";
import { setLocalOpts } from "./localoptions";
import defaultConfig from "../lib/config/default";
import debug from "../lib/misc";

function updateGlobals(settings: Config): void {
	setBangsLookup(settings.bangs);
	setLocalOpts(settings.options);
}

async function setupSettings(): Promise<void> {
	let currentSettings = await storage.getConfig();

	if (currentSettings === undefined) {
		currentSettings = defaultConfig;
	}

	// Technically storage.getSettings should only ever return a settings obj that
	// complies with the current Settings type, but let's not worry about that...
	switch (currentSettings.version) {
		case 3: {
			debug("Converting settings from v3 to v5");
			currentSettings.version = 5;
			currentSettings.options.ignoreBangCase = false;
			currentSettings.options.sortBangsAlpha = false;
			break;
		}
		case 4: {
			debug("Converting settings from v4 to v5");
			currentSettings.version = 5;
			currentSettings.options.sortBangsAlpha = false;
			break;
		}
		default: {
			break;
		}
	}

	updateGlobals(currentSettings);

	// Redundant if no changes made. Only happens once per load tho, not a problem.
	return storage.storeConfig(currentSettings);
}

function main(): void {
	debug(
		`Dev: ${inDev}, Browser: ${currentBrowser}, Version: ${version}, Hash: ${hash}`,
	);

	// Because service workers need to set their event listeners immediately, we can't await this.
	// FIXME: There may be a better way to do this, but for now we just hope it runs quickly!
	setupSettings();

	browser.storage.sync.onChanged.addListener(
		(changes: { settings?: { newValue: string } }) => {
			if (changes.settings !== undefined) {
				const newSettings = storage.decompressSettings(
					changes.settings.newValue,
				);
				if (newSettings !== null) {
					updateGlobals(newSettings);
				}
			}
		},
	);

	// The requestBody opt is required for handling POST situations.
	const extraInfoSpec: browser.WebRequest.OnBeforeRequestOptions[] = [
		"requestBody",
	];

	// Wrap processRequest because the types don't like an async non-blocking handler.
	let webRequestHandler = (
		r: browser.WebRequest.OnBeforeRequestDetailsType,
	) => {
		processRequest(r);
	};

	if (currentBrowser === "firefox") {
		debug("Enabling blocking webRequest listener");
		// Add blocking spec and unwrap processRequest as it may return a blocking response.
		extraInfoSpec.push("blocking");
		webRequestHandler = processRequest;
	}

	browser.webRequest.onBeforeRequest.addListener(
		webRequestHandler,
		{ urls: hostPermissions },
		extraInfoSpec,
	);
}

main();
