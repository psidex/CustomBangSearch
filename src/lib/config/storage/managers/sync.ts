import browser from "webextension-polyfill";

import type StorageManager from "./manager";

const maxItems = 512;
const maxItemSizeBytes = 8192;
const maxTotalSizeBytes = 102400;
const metaKey = "meta";

interface metaInfo {
	keyCount: number;
}

// TODO: Stripe string accross items if needed

const SyncStorageManager: StorageManager = (() => {
	return {
		async set(str: string): Promise<void> {
			return Promise.resolve();
		},
		async get(): Promise<string> {
			return Promise.resolve("");
		},
	};
})();

export default SyncStorageManager;
