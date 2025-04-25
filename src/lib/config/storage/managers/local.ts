import browser from "webextension-polyfill";

import type StorageManager from "./manager";

const storageKey = "config";

const LocalStorageManager: StorageManager = (() => {
	return {
		async set(str: string): Promise<void> {
			return browser.storage.local.set({ [storageKey]: str });
		},
		async get(): Promise<string> {
			const { [storageKey]: str } = await browser.storage.local.get(storageKey);
			if (typeof str !== "string") {
				throw new Error("Could not get from local storage");
			}
			return Promise.resolve(str);
		},
	};
})();

export default LocalStorageManager;
