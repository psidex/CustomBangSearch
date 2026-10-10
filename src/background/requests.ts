import browser, { type WebRequest } from "webextension-polyfill";
import * as config from "../lib/config/config";
import * as storage from "../lib/config/storage/storage";
import { currentBrowser } from "../lib/esbuilddefinitions";
import debug from "../lib/misc";

const possibleQueryParams = ["query", "eingabe", "q"];

/**
 * Construct a URL to send the user to given the quick search URL and query text.
 * @param redirectUrl A URL formatted with `%s` to insert the queryText into.
 * @param queryText The text to insert into the redirectUrl.
 * @param encode If true passes queryText through encodeURIComponent.
 * @returns The formatted URL.
 */
function constructRedirect(
	redirectUrl: string,
	queryText: string,
	encode: boolean,
): string {
	if (queryText === "") {
		return new URL(redirectUrl).origin;
	}
	const replacement = encode ? encodeURIComponent(queryText) : queryText;
	// Use a function so that "$" patterns in the query aren't treated specially
	return redirectUrl.replace(/%s/g, () => replacement);
}

// Runs constructRedirect on each URL in the QuickSearch with the given queryText
// and options
function constructRedirects(
	quickSearch: config.QuickSearch,
	queryText: string,
): Array<string> {
	if (queryText === "" && quickSearch.defaultUrl !== "") {
		return [quickSearch.defaultUrl];
	}
	return quickSearch.urls
		.filter((urlInfo) => urlInfo.url.trim() !== "")
		.map((urlInfo) =>
			constructRedirect(urlInfo.url, queryText, !quickSearch.dontEncodeQuery),
		);
}

/**
 * Given a search request, construct the associated redirects, if a quick search
 * exists in the query.
 * @param request The request details from a WebRequest event.
 * @param cfg The current config.
 * @returns A list of redirections to issue, empty if there are none.
 */
export function getRedirects(
	request: WebRequest.OnBeforeRequestDetailsType,
	cfg: config.Config,
): string[] {
	const url = new URL(request.url);
	let queryText = "";

	// Startpage & searx.be send POST requests, so extract the query from the
	// formdata. Else try to get the query parameter from the URL.

	if (request.method === "POST") {
		if (url.hostname.endsWith("startpage.com")) {
			queryText = request.requestBody?.formData?.query?.[0] ?? "";
		} else if (url.hostname === "searx.be") {
			queryText = request.requestBody?.formData?.q?.[0] ?? "";
		}
	} else {
		queryText =
			possibleQueryParams
				.map((param) => url.searchParams.get(param))
				.find((query): query is string => query !== null) ?? "";
	}

	queryText = queryText.trim();

	// Cut the first trigger and keyword we can find from the query text, it can
	// be anywhere in the string
	const { trigger } = cfg.options;

	// Escape regex special characters in the string (e.g. ")" or "."). This
	// prevents these characters from being interpreted as regex syntax. Note:
	// RegExp.escape() would be cleaner but isn't supported in all browsers yet
	const escapedTrigger = trigger.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

	// Build a regex pattern matching three cases:
	// 1. Trigger at the start of a string followed by whitespace
	// 2. Trigger after whitespace in the middle of a string
	// 3. Trigger at the end of a string

	// To include variables we use a template string, annoyingly because regex
	// uses lots of backslashes we have to escape them all 🤮
	const triggerRegex = new RegExp(
		`(^${escapedTrigger}\\S+\\s|\\s${escapedTrigger}\\S+|^${escapedTrigger}\\S+$)`,
	);

	let keywordUsed = "";
	queryText = queryText
		.replace(triggerRegex, (match) => {
			// Extract keyword from trigger, e.g. !y => y
			keywordUsed = match.trim().replace(trigger, "");
			// Replace trigger and keyword with zero len str
			return "";
		})
		.trim();

	if (keywordUsed.length === 0) {
		return [];
	}

	const { ignoreKeywordCase } = cfg.options;

	// If we don't ignore case, then there will only be one match
	const keywordMatches = (keyword: string) =>
		ignoreKeywordCase
			? keyword.toLowerCase() === keywordUsed.toLowerCase()
			: keyword === keywordUsed;

	// Finally construct the URL(s) to redirect the user to.

	// Build the key keyword:QS lookup table, filter it to just the keyword(s) we
	// want to use, and then construct redirects using the QuickSearches
	return [
		...config.buildQuickSearchLookup(cfg.quickSearches, ignoreKeywordCase),
	]
		.filter(([keyword]) => keywordMatches(keyword))
		.flatMap(([, quickSearch]) => constructRedirects(quickSearch, queryText));
}

/**
 * Process a WebRequest event, redirecting the tab and opening new tabs if the
 * query contains a quick search.
 * @param r The request details.
 * @returns A blocking response to redirect or cancel the request if required
 *          on Firefox, otherwise nothing.
 */
export async function processRequest(
	r: WebRequest.OnBeforeRequestDetailsType,
	// biome-ignore lint/suspicious/noConfusingVoidType: void fine here
): Promise<void | WebRequest.BlockingResponse> {
	if (r.type !== "main_frame") {
		// Should not happen given the onBeforeRequest filter!
		return;
	}

	let cfg: config.Config;
	try {
		cfg = await storage.getConfig();
	} catch (error) {
		// Can't get config, nothing we can do
		console.warn(
			"Could not get config:",
			error instanceof Error ? error.message : "",
		);
		return;
	}

	debug("Request", r, "\nConfig", cfg);

	const { hostname } = new URL(r.url);

	// The ignored domains come from the host permissions, which can include
	// subdomains, e.g. *://*.bing.com/* is shown as bing.com but the request
	// goes to www.bing.com
	if (
		cfg.options.ignoredSearchDomains.some(
			(domain) => hostname === domain || hostname.endsWith(`.${domain}`),
		)
	) {
		return;
	}

	// From the current URL, get the redirections (if any) to apply.
	const redirections = getRedirects(r, cfg);

	if (redirections.length === 0) {
		return;
	}

	// Open all URLs (except the first) in new tabs
	for (const url of redirections.slice(1)) {
		browser.tabs.create({ url });
	}

	if (r.method === "GET" && currentBrowser === "firefox") {
		// This is a GET request, we are on firefox, so send a blocking redirect.
		return { redirectUrl: redirections[0] };
	}

	// If we're handling a POST request, we need to tell the tab where to go, as
	// redirecting the POST would not change the tabs location. OR we're not using
	// firefox, in which case we have to use this method anyway.
	browser.tabs.update(r.tabId, { url: redirections[0] });

	if (currentBrowser === "firefox") {
		return { cancel: true };
	}
}
