/// <reference types="node" />

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildQuickSearchLookup, type QuickSearch } from "./config";

function quickSearch(keyword: string, alias: string | null): QuickSearch {
	return {
		id: keyword,
		keyword,
		alias,
		defaultUrl: "",
		urls: alias === null ? [{ id: `${keyword}-url`, url: "%s" }] : [],
		dontEncodeQuery: false,
	};
}

describe("buildQuickSearchLookup", () => {
	it("maps keywords to quick searches", () => {
		const a = quickSearch("a", null);
		const b = quickSearch("b", null);
		const lookup = buildQuickSearchLookup([a, b], false);
		assert.equal(lookup.get("a"), a);
		assert.equal(lookup.get("b"), b);
		assert.equal(lookup.size, 2);
	});

	it("maps an alias to the quick search it points to", () => {
		const a = quickSearch("a", null);
		const lookup = buildQuickSearchLookup([quickSearch("az", "a"), a], false);
		assert.equal(lookup.get("az"), a);
	});

	it("follows a chain of aliases in any order", () => {
		const a = quickSearch("a", null);
		const lookup = buildQuickSearchLookup(
			[quickSearch("b", "az"), quickSearch("az", "a"), a],
			false,
		);
		assert.equal(lookup.get("b"), a);
	});

	it("matches aliases ignoring case only if asked to", () => {
		const a = quickSearch("a", null);
		const az = quickSearch("az", "A");
		assert.equal(buildQuickSearchLookup([az, a], true).get("az"), a);
		assert.equal(buildQuickSearchLookup([az, a], false).get("az"), az);
	});

	it("keeps keywords' case even when ignoring case", () => {
		const lower = quickSearch("a", null);
		const upper = quickSearch("A", null);
		const lookup = buildQuickSearchLookup([lower, upper], true);
		assert.equal(lookup.get("a"), lower);
		assert.equal(lookup.get("A"), upper);
	});

	it("maps an alias with no target to itself", () => {
		const az = quickSearch("az", "missing");
		assert.equal(buildQuickSearchLookup([az], false).get("az"), az);
	});

	it("maps a loop of aliases to an alias", () => {
		const x = quickSearch("x", "y");
		const y = quickSearch("y", "x");
		const lookup = buildQuickSearchLookup([x, y], false);
		assert.equal(lookup.get("x")?.alias === null, false);
		assert.equal(lookup.get("y")?.alias === null, false);
	});

	it("doesn't find object prototype keys", () => {
		const lookup = buildQuickSearchLookup([quickSearch("a", null)], false);
		assert.equal(lookup.get("constructor"), undefined);
	});
});
