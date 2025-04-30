import browser from "webextension-polyfill";

import {
	inDev,
	currentBrowser,
	version,
	hash,
	hostPermissions,
} from "../lib/esbuilddefinitions";
import { processRequest } from "./requests";
import type * as config from "../lib/config/config";
import * as storage from "../lib/config/storage/storage";
import { setBangInfoLookup } from "./lookup";
import defaultConfig from "../lib/config/default";
import debug from "../lib/misc";

async function initConfig(): Promise<void> {
	let currentCfg: config.Config;

	try {
		currentCfg = await storage.getConfig();
	} catch (error) {
		// TODO(future): What to do here, can we identify what the err is - is it
		// possible that this will erase someones config if they try to access
		// whilst offline? Future TODO because this is not a change in behaviour
		// from the previous version
		console.warn(`Failed to get config: ${error}`);
		currentCfg = defaultConfig;
	}

	await setBangInfoLookup(currentCfg.bangs);

	// This is required if for example we've just set currentCfg to the default
	return storage.storeConfig(currentCfg);
}

function main(): void {
	debug(
		`Dev: ${inDev}, Browser: ${currentBrowser}, Version: ${version}, Hash: ${hash}`,
	);

	// Because service workers need to set their event listeners immediately, we can't await this.
	// TODO(future): There may be a better way to do this, but for now we just hope it runs quickly!
	initConfig();

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
