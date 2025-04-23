import lz from "lz-string";

import { currentConfigVersion, type Config } from "../config";

function compress(str: string): string {
	return lz.compressToUTF16(str);
}

function decompress(toDecompress: string): string {
	return lz.decompressFromUTF16(toDecompress);
}

export function compressConfigToString(cfg: Config): string {
	return compress(JSON.stringify(cfg));
}

/**
 * Decompresses and parses a string into a Config object.
 * @param str - A UTF-16 compressed JSON string representing the config.
 * @returns The decompressed Config.
 * @throws Error if decompression fails, JSON is invalid, the structure is incorrect,
 *         or the config version does not match the current.
 *
 */
export function decompressConfigFromString(str: string): Config {
	const decompressed = decompress(str);
	if (!decompressed) {
		throw new Error("Failed to decompress string");
	}

	let parsed = undefined;
	try {
		parsed = JSON.parse(decompressed);
	} catch {
		throw new Error("Failed to parse JSON from decompressed string");
	}

	if (
		parsed === null ||
		typeof parsed !== "object" ||
		typeof parsed.version !== "number" ||
		typeof parsed.options !== "object" ||
		!Array.isArray(parsed.bangs) ||
		// TODO: This fn will need to allow config version migration in the future
		parsed.version !== currentConfigVersion
	) {
		throw new Error("The given JSON is not a valid Config");
	}

	return parsed as Config;
}
