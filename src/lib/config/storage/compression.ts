import lz from "lz-string";

import * as config from "../config";
import { migrateConfig, NewerConfigVersionError } from "../migrations";

// Stored configs start with a header containing the config version, outside of
// the compressed data, e.g. "\u00017\u0001<compressed config>". This lets this
// version detect a config from a newer version even if the newer version has
// changed how the rest of the string is encoded, so future versions must keep
// this header. lz-string's UTF-16 output only uses characters >= U+0020, so
// strings stored before the header was added never start with the delimiter.
const headerDelimiter = "\u0001";

/**
 * Splits the version header from a stored config string.
 * @param str A stored config string.
 * @returns The version from the header and the rest of the string. version is
 *          null if the string has no header (stored by config version <= 6).
 * @throws Error if the string starts with a malformed header.
 */
function splitHeader(str: string): { version: number | null; body: string } {
	if (!str.startsWith(headerDelimiter)) {
		return { version: null, body: str };
	}

	const end = str.indexOf(headerDelimiter, headerDelimiter.length);
	const version = str.slice(headerDelimiter.length, end);
	if (end === -1 || !/^\d+$/.test(version)) {
		throw new Error("Malformed config header");
	}

	return {
		version: Number(version),
		body: str.slice(end + headerDelimiter.length),
	};
}

/**
 * Checks if a stored config string is from the current config version, i.e.
 * decompressing it doesn't migrate it.
 * @param str A stored config string that decompresses without error.
 * @returns True if the string is from the current config version.
 */
export function isCurrentVersion(str: string): boolean {
	return splitHeader(str).version === config.currentConfigVersion;
}

/**
 * Compresses a Config into a string for storage.
 * @param cfg The config to compress.
 * @returns A version header followed by the UTF-16 compressed JSON of the
 *          config.
 */
export function compressConfigToString(cfg: config.Config): string {
	const header = `${headerDelimiter}${cfg.version}${headerDelimiter}`;
	return header + lz.compressToUTF16(JSON.stringify(cfg));
}

/**
 * Decompresses and parses a string into a Config object, migrating it to the
 * current config version if required.
 * @param str A string created by `compressConfigToString`, or by a version of
 *            the extension from before the version header was added.
 * @returns The decompressed Config.
 * @throws NewerConfigVersionError if the config is from a newer version. This
 *         is checked before anything else, so it is thrown even if the newer
 *         version stores the config in a different format.
 * @throws Error if the header is malformed, decompression fails, JSON is
 *         invalid, the structure is incorrect, or the config can't be
 *         migrated.
 */
export function decompressConfigFromString(str: string): config.Config {
	const { version, body } = splitHeader(str);
	if (version !== null && version > config.currentConfigVersion) {
		throw new NewerConfigVersionError(version);
	}

	const decompressed = lz.decompressFromUTF16(body);
	if (!decompressed) {
		throw new Error("Failed to decompress string");
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(decompressed);
	} catch {
		throw new Error("Failed to parse JSON from decompressed string");
	}

	// This also throws NewerConfigVersionError for a config without a header
	return migrateConfig(parsed);
}
