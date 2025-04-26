import defaultConfig from "./default";

// Must be an integer
export const currentConfigVersion = 6;

export interface Options {
	// The character(s) to trigger the extension
	trigger: string;
	// The storage method for config
	storageMethod: "sync" | "local"; // TODO(future): "url"?
	// Search engine domains to ignore, e.g. searx.tiekoetter.com
	ignoredSearchDomains: string[];
	// If true, ignore bang case
	ignoreBangCase: boolean;
	// Sort bang list alphabetically in configuration UI
	// TODO: Support this in the config UI
	sortBangsAlpha: boolean;
	// If non-empty, this is used to split queries into multiple searches on every URL
	// TODO: Support this in the background script(s)
	querySeparator: string;
}

export interface BangInfo {
	// The actual bang
	keyword: string;
	// If set, ignore URLs and use the URLs set for the bang with this keyword
	alias: string;
	// If the keyword is used without query, override the default location with this
	defaultUrl: string;
	// Associated URLs
	urls: string[];
	// If true, bypass URL encoding of query string
	dontEncodeQuery: boolean;
}

export interface Config {
	version: number;
	options: Options;
	bangs: BangInfo[];
}
