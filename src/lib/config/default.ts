import * as config from "./config";

// TODO: Confirm good defaults
// TODO: US defaults?

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
			defaultUrl: "",
			urls: [
				{
					id: crypto.randomUUID(),
					url: "https://amazon.co.uk/s?k=%s",
				},
			],
			dontEncodeQuery: false,
		},
		{
			id: crypto.randomUUID(),
			keyword: "amz",
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
			defaultUrl: "",
			urls: [
				{
					id: crypto.randomUUID(),
					url: "https://www.ebay.co.uk/sch/i.html?_nkw=%s",
				},
			],
			dontEncodeQuery: true,
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
			defaultUrl: "",
			urls: [
				{
					id: crypto.randomUUID(),
					url: "https://www.etsy.com/uk/search?q=%s",
				},
			],
			dontEncodeQuery: false,
		},
		{
			id: crypto.randomUUID(),
			keyword: "t",
			alias: null,
			defaultUrl: "",
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
			defaultUrl: "",
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
			defaultUrl: "",
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
			defaultUrl: "",
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
			defaultUrl: "",
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
			defaultUrl: "",
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
			defaultUrl: "",
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
			defaultUrl: "",
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
			defaultUrl: "",
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
			defaultUrl: "",
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
			defaultUrl: "",
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
			defaultUrl: "",
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
			defaultUrl: "",
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
