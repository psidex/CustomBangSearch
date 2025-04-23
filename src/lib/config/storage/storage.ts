import browser from "webextension-polyfill";

import type { Config } from "../config";
import {
	compressConfigToString,
	decompressConfigFromString,
} from "./compression";
import type StorageManager from "./managers/manager";
import SyncStorageManager from "./managers/sync";
import LocalStorageManager from "./managers/local";

// TODO: docstring that mentions the error throwing
function getStorageManager(storageType: string): StorageManager {
	switch (storageType) {
		case "sync":
			return SyncStorageManager;
		case "local":
			// TODO: Local should only be allowed if we have unlimited storage?
			return LocalStorageManager;
		default:
			throw new Error("unsupported storage type");
	}
}

export async function storeConfig(
	storageMethod: string,
	cfg: Config,
): Promise<void> {
	const storeMan = getStorageManager(storageMethod);
	const compressed = compressConfigToString(cfg);
	return storeMan.set(compressed);
}

export async function getConfig(storageMethod: string): Promise<Config> {
	const storeMan = getStorageManager(storageMethod);
	const compressed = await storeMan.get();
	const decompressed = decompressConfigFromString(compressed);
	return Promise.resolve(decompressed);
}
