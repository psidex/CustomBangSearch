import browser, { type WebRequest } from "webextension-polyfill";

import { currentBrowser } from "../lib/esbuilddefinitions";
import { getBangInfoLookup } from "./lookup";
import type * as config from "../lib/config/config";
import * as storage from "../lib/config/storage/storage";
import debug from "../lib/misc";

const possibleQueryParams = ["query", "eingabe", "q"];

/**
 * Should this URL be rejected provided the given blacklist?
 * @param blacklist The list of hostnames to reject.
 * @param url The URL to test against the blacklist.
 * @returns Whether or not the URLs hostname exists in the blacklist.
 */
export function shouldReject(
	blacklist: Readonly<string[]>,
	url: string,
): boolean {
	if (blacklist.includes(new URL(url).hostname)) {
		return true;
	}
	return false;
}

/**
 * Construct a URL to send the user to given the bang URL and query text.
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
	let maybeEncoded: string;
	if (encode) {
		maybeEncoded = encodeURIComponent(queryText);
	} else {
		maybeEncoded = queryText;
	}
	return redirectUrl.replace(/%s/g, maybeEncoded);
}

// Runs constructRedirect on each URL in the BangInfo with the given queryText
// and options
function constructRedirects(
	bangInfo: config.BangInfo,
	queryText: string,
): Array<string> {
	const redirs = [];
	// TODO: Investigate bangInfo being undefined here, and remove this log
	if (bangInfo === undefined) {
		console.warn("BANGINFO UNDEFINED", bangInfo, queryText);
	}

	if (queryText === "" && bangInfo.defaultUrl !== "") {
		redirs.push(bangInfo.defaultUrl);
	} else {
		for (const urlInfo of bangInfo.urls) {
			if (urlInfo.url.trim() !== "") {
				redirs.push(
					constructRedirect(urlInfo.url, queryText, !bangInfo.dontEncodeQuery),
				);
			}
		}
	}
	return redirs;
}

/**
 * Given a URL, construct the associated redirects, if a bang exists in the query.
 * @param request The request details from a WebRequest event.
 * @returns A list of redirections to issue.
 */
export async function getRedirects(
	request: WebRequest.OnBeforeRequestDetailsType,
	opts: config.Options,
): Promise<string[]> {
	const url = new URL(request.url);
	let queryText = "";

	// Startpage and searx.be send POST request so extract the query from the formdata.
	// Else try to get the query parameter from the URL.

	if (request !== undefined && request.method === "POST") {
		if (url.hostname.match(/^(.*\.)?startpage.com/gi)) {
			queryText = request.requestBody?.formData?.query?.[0] ?? "";
		} else if (url.hostname.match(/^(.*\/\/)?searx.be/gi)) {
			queryText = request.requestBody?.formData?.q?.[0] ?? "";
		}
	} else {
		for (const param of possibleQueryParams) {
			const queryFromParam = url.searchParams.get(param);
			if (queryFromParam !== null) {
				queryText = queryFromParam;
				break;
			}
		}
	}

	queryText = queryText.trim();

	// if (queryText.length === 0) {
	// 	return [];
	// }

	// Cut the first bang we can find from the query text, it can be anywhere in
	// the string
	const { trigger } = opts;

	// To include variables it has to be templated and all the regex special chars
	// escaped 🤮
	const matchTrigger = new RegExp(
		`(^${trigger}\\S+\\s|\\s${trigger}\\S+|^${trigger}\\S+$)`,
	);

	let keywordUsed = "";
	queryText = queryText.replace(matchTrigger, (match) => {
		keywordUsed = match.trim().replace(trigger, "");
		// Replace bang with zero len str
		return "";
	});

	if (keywordUsed.length === 0) {
		return [];
	}

	const lookup = await getBangInfoLookup();

	// Get all relevant URLs to redirect to / open.
	const redirectionBangInfos: config.BangInfo[] = [];

	if (opts.ignoreBangCase) {
		const allKeys = Object.keys(lookup).filter(
			(key) => key.toLowerCase() === keywordUsed.toLowerCase(),
		);
		for (const k of allKeys) {
			redirectionBangInfos.push(lookup[k]);
		}
	} else {
		// If we don't ignore case, then there will only be one entry
		redirectionBangInfos.push(lookup[keywordUsed]);
	}

	if (redirectionBangInfos.length === 0) {
		return [];
	}

	// Construct the URL(s) to redirect the user to.
	const redirects: Array<string> = [];
	for (const bangInfo of redirectionBangInfos) {
		redirects.push(...constructRedirects(bangInfo, queryText));
	}

	return redirects;
}

/**
 * Process a WebRequest event.
 * @param r The request details.
 * @returns An empty Promise.
 */
// TODO: Check if void is returned here for an API reason
export async function processRequest(
	r: WebRequest.OnBeforeRequestDetailsType,
	// biome-ignore lint/suspicious/noConfusingVoidType:
): Promise<void | WebRequest.BlockingResponse> {
	if (r.type !== "main_frame") {
		// Any request that's not of type main_frame is very unlikely to be of use
		return Promise.resolve();
	}

	// TODO: try/catch?
	const cfg = await storage.getConfig();
	debug("Request", r, "\nConfig", cfg);

	if (shouldReject(cfg.options.ignoredSearchDomains, r.url)) {
		return Promise.resolve();
	}

	// From the current URL, get the redirections (if any) to apply.
	const redirections = await getRedirects(r, cfg.options);

	if (redirections.length === 0) {
		return Promise.resolve();
	}

	// Open all URLs (except the first) in new tabs
	for (let i = 1; i < redirections.length; i += 1) {
		browser.tabs.create({ url: redirections[i] });
	}

	if (r.method !== "GET" || currentBrowser !== "firefox") {
		// If we're handling a POST request, we need to tell the tab where to go, as
		// redirecting the POST would not change the tabs location.
		// OR we're not using firefox, in which case we have to use this method anyway.
		browser.tabs.update(r.tabId, { url: redirections[0] });

		if (currentBrowser === "firefox") {
			return Promise.resolve({ cancel: true });
		}

		return Promise.resolve();
	}

	// This is a GET request, we are on firefox, so send a blocking response.
	return Promise.resolve({ redirectUrl: redirections[0] });
}
