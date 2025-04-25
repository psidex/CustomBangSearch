import browser from "webextension-polyfill";

import type StorageManager from "./manager";

const MAX_TOTAL_SIZE_BYTES = 102400;
const MAX_ITEM_SIZE_BYTES = 8192;
const MAX_ITEM_COUNT = 512;

const encoder = new TextEncoder();

// splitIntoChunks takes in a string which can contain any utf-16 data, and
// returns a map of { id : data } to be stored in sync storage, taking advantage
// of the storage size rules
function splitIntoChunks(toChunk: string): Record<string, string> {
	const chunks: Record<string, string> = {};
	let totalSize = 0;

	let startIdx = 0;
	while (startIdx < toChunk.length) {
		// Because .length does not correlate to size in bytes, we have to brute
		// force
		let endIdx = toChunk.length;

		while (startIdx < endIdx) {
			const slice = toChunk.slice(startIdx, endIdx);

			const size =
				encoder.encode(JSON.stringify(slice)).length +
				// This represents the key being an incrementing integer
				encoder.encode(`${Object.keys(chunks).length}`).length;

			if (size <= MAX_ITEM_SIZE_BYTES) {
				totalSize += size;
				break;
			}

			endIdx--;
		}

		if (endIdx === startIdx) {
			throw new Error(
				`The single character "${toChunk[startIdx]}" has a size in bytes > the maximum of ${MAX_ITEM_SIZE_BYTES}`,
			);
		}

		chunks[`${Object.keys(chunks).length}`] = toChunk.slice(startIdx, endIdx);
		startIdx = endIdx;
	}

	if (Object.keys(chunks).length > MAX_ITEM_COUNT) {
		throw new Error("Too many chunks");
	}

	if (totalSize > MAX_TOTAL_SIZE_BYTES) {
		throw new Error("Too big to store");
	}

	return chunks;
}

// SyncStorageManager takes ownership of the entire sync storage, do not store
// anything else there whilst using this, it will be removed
const SyncStorageManager: StorageManager = (() => {
	return {
		// TODO: Docstring including info about errors for both these fns
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

			return Promise.resolve(unchunked);
		},
	};
})();

export default SyncStorageManager;
