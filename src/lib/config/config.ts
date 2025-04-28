// Must be an integer
export const currentConfigVersion = 6;

// TODO(future): "url"?
export type allowedStorageMethodsAsType = "sync" | "local";

export const allowedStorageMethodsAsArray: Array<allowedStorageMethodsAsType> =
	["sync", "local"];

export interface Options {
	// The character(s) to trigger the extension
	trigger: string;
	// The storage method for config
	storageMethod: allowedStorageMethodsAsType;
	// Search engine domains to ignore, e.g. searx.tiekoetter.com
	ignoredSearchDomains: string[];
	// If true, ignore bang case
	ignoreBangCase: boolean;
	// If non-empty, this is used to split queries into multiple searches on every URL
	// TODO: Support this in the background script(s)? Or implement in later version
	querySeparator: string;
}

export interface UrlInfo {
	// Hidden to the user, uniquely identifies this URL (mainly useful for the React code)
	id: string;
	// A URL
	url: string;
}

export interface BangInfo {
	// Hidden to the user, uniquely identifies this bang (mainly useful for the React code)
	id: string;
	// The actual bang
	keyword: string;
	// If set, ignore URLs and use the URLs set for the bang with this keyword
	// TODO: It turns out this is kind of confusing in the UI, maybe this should be a list of alternative keywords? rename to alt?
	alias: string | null;
	// If the keyword is used without query, override the default location with this
	defaultUrl: string;
	// Associated URLs
	urls: Array<UrlInfo>;
	// If true, bypass URL encoding of query string
	dontEncodeQuery: boolean;
}

export interface Config {
	version: number;
	options: Options;
	bangs: BangInfo[];
}

export type BangsExport = Omit<Config, "options">;
