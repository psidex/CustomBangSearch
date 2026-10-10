/// <reference types="node" />

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import lz from "lz-string";

import * as config from "../../config";
import { compressConfigToString } from "../compression";
import { chunkSize, MAX_CHUNK_SIZE_BYTES, splitIntoChunks } from "./chunks";

// A stored config, which includes the version header, with enough random
// quick searches to need several chunks
function storedConfig(quickSearchCount: number): string {
	const cfg: config.Config = {
		version: config.currentConfigVersion,
		options: {
			trigger: "!",
			storageMethod: "sync",
			ignoredSearchDomains: [],
			ignoreKeywordCase: false,
			advancedMode: false,
		},
		quickSearches: Array.from({ length: quickSearchCount }, (_, i) => ({
			id: crypto.randomUUID(),
			keyword: `k${i}`,
			alias: null,
			defaultUrl: "",
			urls: [{ id: crypto.randomUUID(), url: `https://${i}.com/?q="%s"\\` }],
			dontEncodeQuery: false,
		})),
	};
	return compressConfigToString(cfg);
}

describe("splitIntoChunks", () => {
	it("returns no chunks for an empty string", () => {
		assert.deepEqual(splitIntoChunks(""), {});
	});

	it("splits into maximal chunks that each fit in an item", () => {
		for (const str of [
			storedConfig(100),
			storedConfig(300),
			// Not stored with a header, and characters spread across the range
			// lz-string outputs, including those that need escaping
			lz.compressToUTF16(
				Array.from({ length: 30000 }, (_, i) =>
					String.fromCharCode(32 + ((i * i * 7919) % 0x5000)),
				).join(""),
			),
		]) {
			const chunks = splitIntoChunks(str);
			const keys = Object.keys(chunks);
			assert.ok(keys.length > 1);
			assert.deepEqual(
				keys,
				keys.map((_, i) => `${i}`),
			);
			assert.equal(Object.values(chunks).join(""), str);

			let end = 0;
			for (const key of keys) {
				const chunk = chunks[key];
				end += chunk.length;
				assert.ok(chunkSize(key, chunk) <= MAX_CHUNK_SIZE_BYTES);
				if (end < str.length) {
					// Adding the next character would be too big
					assert.ok(chunkSize(key, chunk + str[end]) > MAX_CHUNK_SIZE_BYTES);
				}
			}
		}
	});

	it("throws if the string is too big for sync storage", () => {
		assert.throws(() => splitIntoChunks(storedConfig(3000)));
	});
});
