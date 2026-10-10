import browser from "webextension-polyfill";

import { splitIntoChunks } from "./chunks";
import type StorageManager from "./manager";

// SyncStorageManager takes ownership of the entire sync storage, do not store
// anything else there whilst using this, it will be removed. set throws if the
// string is too big for sync storage, and get throws if the stored chunks are
// malformed.
const SyncStorageManager: StorageManager = {
	async set(str: string): Promise<void> {
		await browser.storage.sync.clear();
		return browser.storage.sync.set(splitIntoChunks(str));
	},

	async get(): Promise<string> {
		let unchunked = "";

		const chunked = await browser.storage.sync.get(null);

		const maxKey = Math.max(...Object.keys(chunked).map(Number));
		for (let i = 0; i <= maxKey; i++) {
			const str = chunked[i];
			if (typeof str !== "string") {
				throw new Error("Malformed data in sync storage");
			}
			unchunked += str;
		}

		return unchunked;
	},

	async clear(): Promise<void> {
		return browser.storage.sync.clear();
	},

	async isEmpty(): Promise<boolean> {
		const everything = await browser.storage.sync.get(null);
		return Object.keys(everything).length === 0;
	},
};

export default SyncStorageManager;
