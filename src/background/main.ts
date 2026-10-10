import browser from "webextension-polyfill";

import type { Config } from "../lib/config/config";
import defaultConfig from "../lib/config/default";
import { NewerConfigVersionError } from "../lib/config/migrations";
import { getConfigProblem } from "../lib/config/problems";
import * as storage from "../lib/config/storage/storage";
import {
	currentBrowser,
	gitInfo,
	hostPermissions,
	inDev,
	version,
} from "../lib/esbuilddefinitions";
import debug from "../lib/misc";
import { processRequest } from "./requests";

async function initConfig(): Promise<void> {
	await browser.storage.local.set({ mainScriptInitialised: false });
	try {
		await loadConfig();
		// Remove lookup tables stored by older versions
		await browser.storage.local.remove(["quickSearchLookup", "bangInfoLookup"]);
	} finally {
		// Even if loading failed, the config UI can now try to get the config and
		// show the user any error
		await browser.storage.local.set({ mainScriptInitialised: true });
	}
}

// Checks the stored config can be read, migrating it or resetting it to the
// default if required
async function loadConfig(): Promise<void> {
	let currentCfg: Config;
	let needToStore: boolean;

	try {
		// This also migrates configs from older versions
		({ cfg: currentCfg, migrated: needToStore } =
			await storage.getConfigAndIfMigrated());
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		console.warn(`Failed to get config: ${message}`);

		if (error instanceof NewerConfigVersionError) {
			// The config was synced from a newer version of the extension, don't
			// overwrite it. The config UI will show the error to the user
			return;
		}

		// TODO: What to do here, can we identify what the err is - is it possible
		// that this will erase someones config if they try to access whilst
		// offline? Future TODO because this is not a change in behaviour from the
		// previous version
		if (!(await storage.isConfigEmpty())) {
			// Something was stored but it couldn't be read, so tell the user it has
			// been reset. Nothing is stored on a fresh install, which isn't an error
			await browser.storage.local.set({
				[storage.configResetErrorKey]: message,
			});
			if (!inDev) {
				browser.runtime.openOptionsPage();
			}
		}

		currentCfg = defaultConfig();
		needToStore = true;
	}

	if (needToStore) {
		await storage.storeConfig(currentCfg);
	}
}

// Shows a red badge on the toolbar icon if there is a problem with the config,
// so the user knows to open the popup
async function updateBadge(): Promise<void> {
	const problem = await getConfigProblem();
	await browser.action.setBadgeBackgroundColor({ color: "#e03131" });
	await browser.action.setBadgeText({ text: problem === null ? "" : "!" });
}

function main(): void {
	debug(
		`Dev: ${inDev}, Browser: ${currentBrowser}, Version: ${version}, Git: ${gitInfo}`,
	);

	// Because service workers need to set their event listeners immediately, we
	// can't await this.
	// TODO: There may be a better way to do this, but for now we just hope it
	// runs quickly!
	initConfig()
		.catch((error) => {
			console.error("Failed to initialise config:", error);
		})
		.then(updateBadge)
		.catch((error) => {
			console.error("Failed to update badge:", error);
		});

	// The config or reset error can change, e.g. when the config is reset or the
	// reset error is dismissed in the config UI
	browser.storage.onChanged.addListener(() => {
		updateBadge().catch((error) => {
			console.error("Failed to update badge:", error);
		});
	});

	// The requestBody opt is required for handling POST situations.
	const extraInfoSpec: browser.WebRequest.OnBeforeRequestOptions[] = [
		"requestBody",
	];

	// Only firefox can use an async non-blocking handler, Chrome requires us to
	// call `update` on the tab instead.
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

	// Only allowing main_frame means we only handle top-level navigations.
	// Subresource requests (e.g. XHR) must not trigger redirects or open tabs.

	browser.webRequest.onBeforeRequest.addListener(
		webRequestHandler,
		{ types: ["main_frame"], urls: hostPermissions },
		extraInfoSpec,
	);

	if (inDev) {
		// Easier for testing
		browser.runtime.openOptionsPage();
	}
}

main();
