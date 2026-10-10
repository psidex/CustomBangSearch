/// <reference types="node" />

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import lz from "lz-string";

import * as config from "./config";
import {
	migrateConfig,
	migrateExport,
	NewerConfigVersionError,
} from "./migrations";
import { decompressConfigFromString } from "./storage/compression";

const quickSearches = [
	{
		id: "1",
		keyword: "a",
		alias: null,
		defaultUrl: "https://www.amazon.com/",
		urls: [{ id: "2", url: "https://www.amazon.com/s?k=%s" }],
		dontEncodeQuery: false,
	},
	{
		id: "3",
		keyword: "az",
		alias: "a",
		defaultUrl: "",
		urls: [],
		dontEncodeQuery: true,
	},
];

const v6Config = {
	version: 6,
	options: {
		trigger: "#",
		storageMethod: "local",
		ignoredSearchDomains: ["www.google.com"],
		ignoreBangCase: true,
	},
	bangs: quickSearches,
};

const v7Config: config.Config = {
	version: 7,
	options: {
		trigger: "#",
		storageMethod: "local",
		ignoredSearchDomains: ["www.google.com"],
		ignoreKeywordCase: true,
		// On because a quick search has dontEncodeQuery set
		advancedMode: true,
	},
	quickSearches,
};

describe("migrateConfig", () => {
	it("migrates a v6 config", () => {
		assert.deepEqual(migrateConfig(structuredClone(v6Config)), v7Config);
	});

	it("leaves advanced mode off when no v6 bang uses advanced settings", () => {
		const bangs = quickSearches.map((quickSearch) => ({
			...quickSearch,
			dontEncodeQuery: false,
		}));
		const migrated = migrateConfig({ ...structuredClone(v6Config), bangs });
		assert.equal(migrated.options.advancedMode, false);
	});

	it("leaves a current config unchanged", () => {
		assert.deepEqual(migrateConfig(structuredClone(v7Config)), v7Config);
	});

	it("throws NewerConfigVersionError for a newer config", () => {
		assert.throws(
			() =>
				migrateConfig({
					...v7Config,
					version: config.currentConfigVersion + 1,
				}),
			NewerConfigVersionError,
		);
	});

	it("throws for an unsupported older version", () => {
		assert.throws(
			() => migrateConfig({ ...v6Config, version: 4 }),
			(error: unknown) =>
				error instanceof Error && !(error instanceof NewerConfigVersionError),
		);
	});

	it("throws for invalid configs", () => {
		assert.throws(() => migrateConfig(null));
		assert.throws(() => migrateConfig({ options: {}, quickSearches: [] }));
		assert.throws(() => migrateConfig({ version: 7, quickSearches: [] }));
		assert.throws(() => migrateConfig({ version: 7, options: {} }));
		assert.throws(() => migrateConfig({ version: 6, bangs: [] }));
	});
});

describe("migrateExport", () => {
	const v7Export = {
		version: 7,
		quickSearches: config.quickSearchesToExport(quickSearches),
	};

	it("migrates a v6 export", () => {
		const v6Export = {
			version: 6,
			bangs: config.quickSearchesToExport(quickSearches),
		};
		assert.deepEqual(migrateExport(v6Export), v7Export);
	});

	it("leaves a current export unchanged", () => {
		assert.deepEqual(migrateExport(structuredClone(v7Export)), v7Export);
	});

	it("throws NewerConfigVersionError for a newer export", () => {
		assert.throws(
			() =>
				migrateExport({
					...v7Export,
					version: config.currentConfigVersion + 1,
				}),
			NewerConfigVersionError,
		);
	});

	it("throws for invalid exports", () => {
		assert.throws(() => migrateExport({ version: 7 }));
		assert.throws(() => migrateExport({ version: 6, quickSearches: [] }));
	});
});

describe("decompressConfigFromString", () => {
	it("migrates a stored v6 config", () => {
		const stored = lz.compressToUTF16(JSON.stringify(v6Config));
		assert.deepEqual(decompressConfigFromString(stored), v7Config);
	});

	it("throws NewerConfigVersionError for a stored newer config", () => {
		const stored = lz.compressToUTF16(
			JSON.stringify({ ...v7Config, version: config.currentConfigVersion + 1 }),
		);
		assert.throws(
			() => decompressConfigFromString(stored),
			NewerConfigVersionError,
		);
	});
});
