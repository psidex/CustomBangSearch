// Must be an integer. If you change this, add a migration in migrations.ts
export const currentConfigVersion = 7;

// TODO: Custom sync server?
export const allowedStorageMethodsAsArray = ["sync", "local"] as const;

export type allowedStorageMethodsAsType =
	(typeof allowedStorageMethodsAsArray)[number];

export interface Options {
	// The character(s) to trigger the extension
	trigger: string;
	// The storage method for config
	storageMethod: allowedStorageMethodsAsType;
	// Search engine domains to ignore, e.g. searx.tiekoetter.com
	ignoredSearchDomains: string[];
	// If true, ignore keyword case
	ignoreKeywordCase: boolean;
	// If true, show advanced settings in the config UI, e.g. "Don't encode query"
	advancedMode: boolean;
	// TODO: Support this?
	// If non-empty, this is used to split queries into multiple searches on every URL
	// querySeparator: string;
}

export interface UrlInfo {
	// Hidden to the user, uniquely identifies this URL (mainly useful for the React code)
	id: string;
	// A URL
	url: string;
}

export interface QuickSearch {
	// Hidden to the user, uniquely identifies this quick search (mainly useful for the React code)
	id: string;
	// The keyword typed after the trigger
	keyword: string;
	// If set, ignore URLs and use the URLs set for the quick search with this keyword
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
	quickSearches: QuickSearch[];
}

// The same as QuickSearch with all the "id" fields omitted
export type QuickSearchExport = Omit<QuickSearch, "id" | "urls"> & {
	urls: string[];
};

// The same as Config without options and with all the "id" fields omitted
export type QuickSearchesExport = {
	version: number;
	quickSearches: QuickSearchExport[];
};

/**
 * Creates a quick search with new ids.
 * @param keyword The keyword typed after the trigger.
 * @param defaultUrl The URL used if there's no query, or "".
 * @param urls The URLs to redirect to.
 * @param alias The keyword this is an alias for, or null if it isn't one.
 * @returns The new quick search, with query encoding on.
 */
export function newQuickSearch(
	keyword: string,
	defaultUrl: string,
	urls: string[],
	alias: string | null = null,
): QuickSearch {
	return {
		id: crypto.randomUUID(),
		keyword,
		alias,
		defaultUrl,
		urls: urls.map((url) => ({ id: crypto.randomUUID(), url })),
		dontEncodeQuery: false,
	};
}

/**
 * Builds a lookup table of keyword to quick search. Each alias maps to the
 * quick search at the end of its chain of aliases. If an alias points to a
 * keyword that doesn't exist, or the chain loops, it maps to an alias in the
 * chain, which has no URLs so does nothing.
 * @param quickSearches The quick searches from a config.
 * @param ignoreCase If true, aliases match keywords ignoring case.
 * @returns The lookup table, keyed by each quick search's keyword. If there are
 *          duplicate keywords, the last one is used.
 */
export function buildQuickSearchLookup(
	quickSearches: QuickSearch[],
	ignoreCase: boolean,
): Map<string, QuickSearch> {
	const normalise = (keyword: string) =>
		ignoreCase ? keyword.toLowerCase() : keyword;

	const byKeyword = new Map<string, QuickSearch>();
	for (const quickSearch of quickSearches) {
		byKeyword.set(normalise(quickSearch.keyword), quickSearch);
	}

	const resolve = (quickSearch: QuickSearch): QuickSearch => {
		const seen = new Set<QuickSearch>();
		let current = quickSearch;
		while (current.alias !== null && !seen.has(current)) {
			seen.add(current);
			const target = byKeyword.get(normalise(current.alias));
			if (target === undefined) {
				break;
			}
			current = target;
		}
		return current;
	};

	return new Map(
		quickSearches.map((quickSearch) => [
			quickSearch.keyword,
			resolve(quickSearch),
		]),
	);
}

export function quickSearchesFromExport(
	quickSearches: QuickSearchExport[],
): QuickSearch[] {
	return quickSearches.map((quickSearch) => ({
		...newQuickSearch(
			quickSearch.keyword,
			quickSearch.defaultUrl,
			quickSearch.urls,
			quickSearch.alias,
		),
		dontEncodeQuery: quickSearch.dontEncodeQuery,
	}));
}

export function quickSearchesToExport(
	quickSearches: QuickSearch[],
): QuickSearchExport[] {
	return quickSearches.map((quickSearch) => ({
		keyword: quickSearch.keyword,
		alias: quickSearch.alias,
		defaultUrl: quickSearch.defaultUrl,
		urls: quickSearch.urls.map((urlInfo) => urlInfo.url),
		dontEncodeQuery: quickSearch.dontEncodeQuery,
	}));
}
