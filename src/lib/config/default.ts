import browser from "webextension-polyfill";

import * as config from "./config";

const locale = navigator.language || browser.i18n.getUILanguage();

function getUrlByLocale(table: Record<string, string>): string {
	return table[locale] || table[locale.split("-")[0]] || table.default;
}

function getAmazonUrlByLocale(): string {
	// TODO: More locale support?
	return getUrlByLocale({
		"en-GB": "https://www.amazon.co.uk/",
		"en-US": "https://www.amazon.com/",
		"de-DE": "https://www.amazon.de/",
		"fr-FR": "https://www.amazon.fr/",
		"it-IT": "https://www.amazon.it/",
		"es-ES": "https://www.amazon.es/",
		"ja-JP": "https://www.amazon.co.jp/",
		au: "https://www.amazon.com.au/",
		ca: "https://www.amazon.ca/",
		default: "https://www.amazon.com/",
	});
}

function getEbayUrlByLocale(): string {
	return getUrlByLocale({
		"en-GB": "https://www.ebay.co.uk/",
		"en-US": "https://www.ebay.com/",
		"de-DE": "https://www.ebay.de/",
		"fr-FR": "https://www.ebay.fr/",
		"it-IT": "https://www.ebay.it/",
		"es-ES": "https://www.ebay.es/",
		"ja-JP": "https://www.ebay.co.jp/",
		au: "https://www.ebay.com.au/",
		ca: "https://www.ebay.ca/",
		default: "https://www.ebay.com/",
	});
}

const amazonUrl = getAmazonUrlByLocale();
const ebayUrl = getEbayUrlByLocale();

// NOTE: Don't remove or rename the "a" and "az" quick searches, the config UI
// help tab looks them up by keyword

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
		config.newQuickSearch("a", amazonUrl, [`${amazonUrl}s?k=%s`]),
		config.newQuickSearch("az", "", [""], "a"),
		config.newQuickSearch("e", ebayUrl, [`${ebayUrl}sch/i.html?_nkw=%s`]),
		config.newQuickSearch("ea", "", [
			"https://amazon.co.uk/s?k=%s",
			"https://www.ebay.co.uk/sch/i.html?_nkw=%s",
		]),
		config.newQuickSearch("et", "https://www.etsy.com/", [
			"https://www.etsy.com/search?q=%s",
		]),
		config.newQuickSearch("t", "https://www.twitch.tv/", [
			"https://www.twitch.tv/search?term=%s",
		]),
		config.newQuickSearch("y", "https://www.youtube.com/", [
			"https://www.youtube.com/results?search_query=%s",
		]),
		config.newQuickSearch(
			"av",
			"https://www.amazon.co.uk/gp/video/storefront",
			["https://amazon.co.uk/s?k=%s&i=instant-video"],
		),
		config.newQuickSearch("n", "https://www.netflix.com/browse", [
			"https://www.netflix.com/search?q=%s",
		]),
		config.newQuickSearch("g", "https://www.google.com/", [
			"https://www.google.com/search?q=%s",
		]),
		config.newQuickSearch("b", "https://www.bing.com/", [
			"https://www.bing.com/search?q=%s",
		]),
		config.newQuickSearch("d", "https://duckduckgo.com/", [
			"https://duckduckgo.com/?q=%s",
		]),
		config.newQuickSearch("q", "https://www.qwant.com/", [
			"https://www.qwant.com/?q=%s",
		]),
		config.newQuickSearch("m", "https://www.google.com/maps", [
			"https://www.google.com/maps/search/%s",
		]),
		config.newQuickSearch("r", "https://www.reddit.com/", [
			"https://www.google.com/search?q=site%3Areddit.com+%s",
		]),
		config.newQuickSearch("git", "https://github.com/", [
			"https://github.com/search?q=%s",
		]),
		config.newQuickSearch("mdn", "https://developer.mozilla.org/", [
			"https://developer.mozilla.org/en-US/search?q=%s",
		]),
		config.newQuickSearch("pypi", "", ["https://pypi.org/search/?q=%s"]),
		config.newQuickSearch("npm", "", ["https://www.npmjs.com/search?q=%s"]),
		config.newQuickSearch("so", "https://stackoverflow.com/", [
			"https://stackoverflow.com/search?q=%s",
		]),
		config.newQuickSearch("w", "https://www.wolframalpha.com/", [
			"https://www.wolframalpha.com/input/?i=%s",
		]),
	],
};

/**
 * Create a mutable copy of the default config.
 *
 * @returns A mutable copy of the default config.
 */
export default function defaultConfig(): config.Config {
	return structuredClone(cfg);
}
