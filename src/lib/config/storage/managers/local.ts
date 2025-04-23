import browser from "webextension-polyfill";

import { currentBrowser } from "../../../esbuilddefinitions";
import type StorageManager from "./manager";
import { byteSize } from "./manager";

//
// https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria#how_much_data_can_be_stored
// "Browsers can store up to 5 MiB of local storage"
//
// https://developer.chrome.com/docs/extensions/mv2/reference/storage#property-local
// "10485760 - The maximum amount (in bytes) of data that can be stored in local
// storage, as measured by the JSON stringification of every value plus every
// key's length"
//

const maxTotalSizeBytes = currentBrowser === "chrome" ? 10485760 : 5242880;
const storageKey = "config";

const LocalStorageManager: StorageManager = (() => {
	return {
		async set(str: string): Promise<void> {
			if (byteSize(str) > maxTotalSizeBytes) {
				throw new Error(
					`Length of string ${str.length} > ${maxTotalSizeBytes}`,
				);
			}
			return browser.storage.local.set({ [storageKey]: str });
		},
		async get(): Promise<string> {
			const { [storageKey]: str } = await browser.storage.local.get(storageKey);
			if (typeof str !== "string") {
				throw new Error("Could not get config string from local storage");
			}
			return Promise.resolve(str);
		},
	};
})();

export default LocalStorageManager;
