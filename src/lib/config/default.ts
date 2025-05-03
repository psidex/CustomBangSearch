import browser from "webextension-polyfill";

import * as config from "./config";

const locale = navigator.language || browser.i18n.getUILanguage();

function getUrlByLocale(table: Record<string, string>): string {
	return table[locale] || table[locale.split("-")[0]] || table.default;
}

function getAmazonUrlByLocale(): string {
	// TODO(future): More locale support?
	return getUrlByLocale({
		"en-GB": "https://www.amazon.co.uk/",
		"en-US": "https://www.amazon.com/",
		"de-DE": "https://www.amazon.de/",
		"fr-FR": "https://www.amazon.fr/",
		"it-IT": "https://www.amazon.it/",
		"es-ES": "https://www.amazon.es/",
		"ja-JP": "https://www.amazon.co.jp/",
		au: "https://www.amazon.com.au/",
		ca: "https://www.amazon.ca",
		default: "https://www.amazon.com/",
	});
}

function getEbayUrlByLocale(): string {
	return getUrlByLocale({
		"en-GB": "https://www.ebay.co.uk",
		"en-US": "https://www.ebay.com",
		"de-DE": "https://www.ebay.de",
		"fr-FR": "https://www.ebay.fr",
		"it-IT": "https://www.ebay.it",
		"es-ES": "https://www.ebay.es",
		"ja-JP": "https://www.ebay.co.jp/",
		au: "https://www.ebay.com.au",
		ca: "https://www.ebay.ca",
		default: "https://www.ebay.com",
	});
}

// NOTE: Don't change the first or second index, these are used in the config UI
// help tab

const cfg: config.Config = {
	version: config.currentConfigVersion,
	options: {
		trigger: "!",
		storageMethod: "sync",
		ignoredSearchDomains: [],
		ignoreBangCase: false,
	},
	bangs: [
		{
			id: crypto.randomUUID(),
			keyword: "a",
			alias: null,
			defaultUrl: getAmazonUrlByLocale(),
			urls: [
				{
					id: crypto.randomUUID(),
					url: `${getAmazonUrlByLocale()}s?k=%s`,
				},
			],
			dontEncodeQuery: false,
		},
		{
			id: crypto.randomUUID(),
			keyword: "az",
			alias: "a",
			defaultUrl: "",
			urls: [
				{
					id: crypto.randomUUID(),
					url: "",
				},
			],
			dontEncodeQuery: false,
		},
		{
			id: crypto.randomUUID(),
			keyword: "e",
			alias: null,
			defaultUrl: getEbayUrlByLocale(),
			urls: [
				{
					id: crypto.randomUUID(),
					url: `${getEbayUrlByLocale()}sch/i.html?_nkw=%s`,
				},
			],
			dontEncodeQuery: false,
		},
		{
			id: crypto.randomUUID(),
			keyword: "ea",
			alias: null,
			defaultUrl: "",
			urls: [
				{
					id: crypto.randomUUID(),
					url: "https://amazon.co.uk/s?k=%s",
				},
				{
					id: crypto.randomUUID(),
					url: "https://www.ebay.co.uk/sch/i.html?_nkw=%s",
				},
			],
			dontEncodeQuery: false,
		},
		{
			id: crypto.randomUUID(),
			keyword: "et",
			alias: null,
			defaultUrl: "https://www.etsy.com/",
			urls: [
				{
					id: crypto.randomUUID(),
					url: "https://www.etsy.com/search?q=%s",
				},
			],
			dontEncodeQuery: false,
		},
		{
			id: crypto.randomUUID(),
			keyword: "t",
			alias: null,
			defaultUrl: "https://www.twitch.tv/",
			urls: [
				{
					id: crypto.randomUUID(),
					url: "https://www.twitch.tv/search?term=%s",
				},
			],
			dontEncodeQuery: false,
		},
		{
			id: crypto.randomUUID(),
			keyword: "y",
			alias: null,
			defaultUrl: "https://www.youtube.com/",
			urls: [
				{
					id: crypto.randomUUID(),
					url: "https://www.youtube.com/results?search_query=%s",
				},
			],
			dontEncodeQuery: false,
		},
		{
			id: crypto.randomUUID(),
			keyword: "av",
			alias: null,
			defaultUrl: "https://www.amazon.co.uk/gp/video/storefront",
			urls: [
				{
					id: crypto.randomUUID(),
					url: "https://amazon.co.uk/s?k=%s&i=instant-video",
				},
			],
			dontEncodeQuery: false,
		},
		{
			id: crypto.randomUUID(),
			keyword: "n",
			alias: null,
			defaultUrl: "https://www.netflix.com/browse",
			urls: [
				{
					id: crypto.randomUUID(),
					url: "https://www.netflix.com/search?q=%s",
				},
			],
			dontEncodeQuery: false,
		},
		{
			id: crypto.randomUUID(),
			keyword: "g",
			alias: null,
			defaultUrl: "https://www.google.com/",
			urls: [
				{
					id: crypto.randomUUID(),
					url: "https://www.google.com/search?q=%s",
				},
			],
			dontEncodeQuery: false,
		},
		{
			id: crypto.randomUUID(),
			keyword: "b",
			alias: null,
			defaultUrl: "https://www.bing.com/",
			urls: [
				{
					id: crypto.randomUUID(),
					url: "https://www.bing.com/search?q=%s",
				},
			],
			dontEncodeQuery: false,
		},
		{
			id: crypto.randomUUID(),
			keyword: "d",
			alias: null,
			defaultUrl: "https://duckduckgo.com/",
			urls: [
				{
					id: crypto.randomUUID(),
					url: "https://duckduckgo.com/?q=%s",
				},
			],
			dontEncodeQuery: false,
		},
		{
			id: crypto.randomUUID(),
			keyword: "q",
			alias: null,
			defaultUrl: "https://www.qwant.com/",
			urls: [
				{
					id: crypto.randomUUID(),
					url: "https://www.qwant.com/?q=%s",
				},
			],
			dontEncodeQuery: false,
		},
		{
			id: crypto.randomUUID(),
			keyword: "m",
			alias: null,
			defaultUrl: "https://www.google.com/maps",
			urls: [
				{
					id: crypto.randomUUID(),
					url: "https://www.google.com/maps/search/%s",
				},
			],
			dontEncodeQuery: false,
		},
		{
			id: crypto.randomUUID(),
			keyword: "r",
			alias: null,
			defaultUrl: "https://www.reddit.com/",
			urls: [
				{
					id: crypto.randomUUID(),
					url: "https://www.google.com/search?q=site%3Areddit.com+%s",
				},
			],
			dontEncodeQuery: false,
		},
		{
			id: crypto.randomUUID(),
			keyword: "git",
			alias: null,
			defaultUrl: "https://github.com/",
			urls: [
				{
					id: crypto.randomUUID(),
					url: "https://github.com/search?q=%s",
				},
			],
			dontEncodeQuery: false,
		},
		{
			id: crypto.randomUUID(),
			keyword: "mdn",
			alias: null,
			defaultUrl: "https://developer.mozilla.org/",
			urls: [
				{
					id: crypto.randomUUID(),
					url: "https://developer.mozilla.org/en-US/search?q=%s",
				},
			],
			dontEncodeQuery: false,
		},
		{
			id: crypto.randomUUID(),
			keyword: "pypi",
			alias: null,
			defaultUrl: "",
			urls: [
				{
					id: crypto.randomUUID(),
					url: "https://pypi.org/search/?q=%s",
				},
			],
			dontEncodeQuery: false,
		},
		{
			id: crypto.randomUUID(),
			keyword: "npm",
			alias: null,
			defaultUrl: "",
			urls: [
				{
					id: crypto.randomUUID(),
					url: "https://www.npmjs.com/search?q=%s",
				},
			],
			dontEncodeQuery: false,
		},
		{
			id: crypto.randomUUID(),
			keyword: "so",
			alias: null,
			defaultUrl: "https://stackoverflow.com/",
			urls: [
				{
					id: crypto.randomUUID(),
					url: "https://stackoverflow.com/search?q=%s",
				},
			],
			dontEncodeQuery: false,
		},
		{
			id: crypto.randomUUID(),
			keyword: "w",
			alias: null,
			defaultUrl: "https://www.wolframalpha.com/",
			urls: [
				{
					id: crypto.randomUUID(),
					url: "https://www.wolframalpha.com/input/?i=%s",
				},
			],
			dontEncodeQuery: false,
		},
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
