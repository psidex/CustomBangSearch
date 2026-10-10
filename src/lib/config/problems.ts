import browser from "webextension-polyfill";

import * as storage from "./storage/storage";

/**
 * Gets a message describing any problem with the config that the options page
 * would show a warning or error for.
 * @returns The message, or null if there is no problem.
 */
export async function getConfigProblem(): Promise<string | null> {
	const { mainScriptInitialised, [storage.configResetErrorKey]: resetError } =
		await browser.storage.local.get([
			"mainScriptInitialised",
			storage.configResetErrorKey,
		]);

	// The config may not be readable until the main script has initialised it
	if (!mainScriptInitialised) {
		return null;
	}

	try {
		await storage.getConfig();
	} catch (_) {
		return `Your config could not be read from storage.`;
	}

	if (typeof resetError === "string") {
		return `Your config could not be read from storage and has been reset to the default.`;
	}
	return null;
}
