import browser from "webextension-polyfill";

import type { Config } from "../config";
import {
	compressConfigToString,
	decompressConfigFromString,
} from "./compression";
import type StorageManager from "./managers/manager";
import SyncStorageManager from "./managers/sync";
import LocalStorageManager from "./managers/local";
import debug from "../../misc";

// NOTE: This should match the cases in the switch in getStorageManager
export const permittedStorageMethods = ["sync", "local"];

// TODO: docstrings for below fns that mention the error throwing
// TODO: Don't leave info behind in storage method thats not selected?

async function getStorageManager(
	storageMethod: string,
): Promise<StorageManager> {
	switch (storageMethod) {
		case "sync":
			return SyncStorageManager;
		case "local":
			return LocalStorageManager;
		default:
			throw new Error("unsupported storage type");
	}
}

export async function storeConfig(
	storageMethod: string,
	cfg: Config,
): Promise<void> {
	const storeMan = await getStorageManager(storageMethod);
	const compressed = compressConfigToString(cfg);
	return storeMan.set(compressed);
}

export async function getConfig(storageMethod: string): Promise<Config> {
	const storeMan = await getStorageManager(storageMethod);
	const compressed = await storeMan.get();
	debug(`getConfig compressed: ${compressed}`);
	const decompressed = decompressConfigFromString(compressed);
	return Promise.resolve(decompressed);
}
