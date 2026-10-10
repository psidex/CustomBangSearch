/// <reference types="node" />

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import lz from "lz-string";

import * as config from "../config";
import { NewerConfigVersionError } from "../migrations";
import {
	compressConfigToString,
	decompressConfigFromString,
	isCurrentVersion,
} from "./compression";

const cfg: config.Config = {
	version: config.currentConfigVersion,
	options: {
		trigger: "!",
		storageMethod: "sync",
		ignoredSearchDomains: [],
		ignoreKeywordCase: false,
		advancedMode: false,
	},
	quickSearches: [
		{
			id: "1",
			keyword: "a",
			alias: null,
			defaultUrl: "https://www.amazon.com/",
			urls: [{ id: "2", url: "https://www.amazon.com/s?k=%s" }],
			dontEncodeQuery: false,
		},
	],
};

describe("compression", () => {
	it("round trips a config", () => {
		assert.deepEqual(
			decompressConfigFromString(compressConfigToString(cfg)),
			cfg,
		);
	});

	it("reads a config stored without a header", () => {
		const stored = lz.compressToUTF16(JSON.stringify(cfg));
		assert.deepEqual(decompressConfigFromString(stored), cfg);
	});

	it("throws NewerConfigVersionError for a newer config in an unknown format", () => {
		const newer = config.currentConfigVersion + 1;
		assert.throws(
			() => decompressConfigFromString(`\u0001${newer}\u0001not lz-string`),
			NewerConfigVersionError,
		);
	});

	it("throws NewerConfigVersionError for a newer config with a header", () => {
		const newer = { ...cfg, version: config.currentConfigVersion + 1 };
		assert.throws(
			() => decompressConfigFromString(compressConfigToString(newer)),
			NewerConfigVersionError,
		);
	});

	it("only treats a current config with a header as the current version", () => {
		assert.equal(isCurrentVersion(compressConfigToString(cfg)), true);
		assert.equal(
			isCurrentVersion(lz.compressToUTF16(JSON.stringify(cfg))),
			false,
		);
		const older = { ...cfg, version: config.currentConfigVersion - 1 };
		assert.equal(isCurrentVersion(compressConfigToString(older)), false);
	});

	it("throws for a malformed header", () => {
		for (const stored of [
			"\u0001",
			"\u00017",
			"\u0001\u0001",
			"\u0001x\u0001",
		]) {
			assert.throws(
				() => decompressConfigFromString(stored),
				(error: unknown) =>
					error instanceof Error && !(error instanceof NewerConfigVersionError),
			);
		}
	});
});
