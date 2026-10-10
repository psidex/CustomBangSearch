//
// Splits strings into chunks for sync storage. This file must not import
// anything that depends on the browser, so that it can be unit tested in Node.
//

export const MAX_TOTAL_SIZE_BYTES = 102400;
const MAX_ITEM_SIZE_BYTES = 8192;
const MAX_ITEM_COUNT = 512;

// TODO: Why do we get item quota errors using the proper size here (hence
// -1000)
export const MAX_CHUNK_SIZE_BYTES = MAX_ITEM_SIZE_BYTES - 1000;

const encoder = new TextEncoder();

/**
 * The size in bytes of a UTF-16 code unit once it is JSON encoded, excluding
 * the quotes. Exact for strings without surrogate pairs, such as stored
 * configs (see compression.ts), and an overestimate for surrogates, which are
 * sized as if they were escaped.
 */
function jsonEncodedSize(codeUnit: string): number {
	return encoder.encode(JSON.stringify(codeUnit)).length - 2;
}

/**
 * The size in bytes of a chunk stored in sync storage: its JSON encoded value
 * including the quotes, plus its key.
 */
export function chunkSize(key: string, chunk: string): number {
	return (
		encoder.encode(JSON.stringify(chunk)).length + encoder.encode(key).length
	);
}

/**
 * splitIntoChunks takes in a string which can contain any utf-16 data, and
 * returns a map of { id : data } to be stored in sync storage, taking advantage
 * of the storage size rules. Each chunk is as big as fits in a single item, and
 * the ids are incrementing integers from "0".
 * @param toChunk The string to break up into chunks.
 * @returns A map of { id : data } to be stored in sync storage.
 * @throws Error if the string is too big to store in sync storage.
 */
export function splitIntoChunks(toChunk: string): Record<string, string> {
	const chunks: Record<string, string> = {};
	let chunkCount = 0;
	let totalSize = 0;

	let startIdx = 0;
	// The size of the current chunk, see chunkSize
	let size = chunkSize(`${chunkCount}`, "");

	for (let idx = 0; idx < toChunk.length; idx++) {
		const charSize = jsonEncodedSize(toChunk[idx]);

		if (size + charSize > MAX_CHUNK_SIZE_BYTES) {
			if (idx === startIdx) {
				throw new Error(
					`The single character "${toChunk[idx]}" has a size in bytes > the maximum of ${MAX_ITEM_SIZE_BYTES}`,
				);
			}
			chunks[`${chunkCount}`] = toChunk.slice(startIdx, idx);
			chunkCount++;
			totalSize += size;
			startIdx = idx;
			size = chunkSize(`${chunkCount}`, "");
		}

		size += charSize;
	}

	if (startIdx < toChunk.length) {
		chunks[`${chunkCount}`] = toChunk.slice(startIdx);
		chunkCount++;
		totalSize += size;
	}

	if (chunkCount > MAX_ITEM_COUNT) {
		throw new Error("Too many chunks");
	}

	if (totalSize > MAX_TOTAL_SIZE_BYTES) {
		throw new Error("Too big to store");
	}

	return chunks;
}
