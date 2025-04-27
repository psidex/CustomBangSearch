import browser from "webextension-polyfill";

import {
	allowedStorageMethodsAsArray,
	type Config,
	type allowedStorageMethodsAsType,
} from "../config";
import {
	compressConfigToString,
	decompressConfigFromString,
} from "./compression";
import type StorageManager from "./managers/manager";
import SyncStorageManager from "./managers/sync";
import LocalStorageManager from "./managers/local";

// NOTE: Defaulting to sync is important because it means if someone is using a
// new browser instance, we will auto fetch their stuff stored in sync
const defaultStorageMethod = "sync";

// TODO: docstrings for below fns that mention the error throwing

async function getStorageManagerMethod(): Promise<allowedStorageMethodsAsType> {
	let { storageMethod } = await browser.storage.local.get("storageMethod");
	if (
		storageMethod === null ||
		storageMethod === undefined ||
		typeof storageMethod !== "string" ||
		!allowedStorageMethodsAsArray.includes(
			storageMethod as allowedStorageMethodsAsType,
		)
	) {
		storageMethod = defaultStorageMethod;
	}
	return storageMethod as allowedStorageMethodsAsType;
}

async function getStorageManager(): Promise<StorageManager> {
	switch (await getStorageManagerMethod()) {
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

export async function clearUnusedStorageManagers(): Promise<void> {
	switch (await getStorageManagerMethod()) {
		case "sync":
			return LocalStorageManager.clear();
		case "local":
			return SyncStorageManager.clear();
		default:
			throw new Error("unsupported storage type");
	}
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
