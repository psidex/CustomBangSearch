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
const defaultStorageMethod = "sync";

// TODO: docstrings for below fns that mention the error throwing

async function getStorageManager(): Promise<StorageManager> {
	let { storageMethod } = await browser.storage.local.get("storageMethod");
	if (
		storageMethod === null ||
		storageMethod === undefined ||
		typeof storageMethod !== "string" ||
		!permittedStorageMethods.includes(storageMethod)
	) {
		storageMethod = defaultStorageMethod;
	}
	switch (storageMethod) {
		case "sync":
			return SyncStorageManager;
		case "local":
			return LocalStorageManager;
		default:
			throw new Error("unsupported storage type");
	}
}

export async function updateStorageManagerMethod(
	method: string,
): Promise<void> {
	// TODO: Clear the data from any other methods?
	return browser.storage.local.set({ storageMethod: method });
}

export async function storeConfig(cfg: Config): Promise<void> {
	const storeMan = await getStorageManager();
	const compressed = compressConfigToString(cfg);
	return storeMan.set(compressed);
}

export async function getConfig(): Promise<Config> {
	const storeMan = await getStorageManager();
	const compressed = await storeMan.get();
	const decompressed = decompressConfigFromString(compressed);
	return Promise.resolve(decompressed);
}
