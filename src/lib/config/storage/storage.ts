import browser from "webextension-polyfill";

import * as config from "../config";
import * as compression from "./compression";
import type StorageManager from "./managers/manager";
import SyncStorageManager from "./managers/sync";
import LocalStorageManager from "./managers/local";

// NOTE: Defaulting to sync is important because it means if someone is using a
// new browser instance, we will auto fetch their stuff stored in sync
const defaultStorageMethod = "sync";

// TODO: docstrings for below fns that mention the error throwing

async function getStorageManagerMethod(): Promise<config.allowedStorageMethodsAsType> {
	let { storageMethod } = await browser.storage.local.get("storageMethod");
	if (
		storageMethod === null ||
		storageMethod === undefined ||
		typeof storageMethod !== "string" ||
		!config.allowedStorageMethodsAsArray.includes(
			storageMethod as config.allowedStorageMethodsAsType,
		)
	) {
		storageMethod = defaultStorageMethod;
	}
	return storageMethod as config.allowedStorageMethodsAsType;
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

// TODO: docstring, include that you should probably call
// clearUnusedStorageManagers after calling this
export async function updateStorageManagerMethod(
	method: string,
): Promise<void> {
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

export async function storeConfig(cfg: config.Config): Promise<void> {
	const storeMan = await getStorageManager();
	const compressed = compression.compressConfigToString(cfg);
	return storeMan.set(compressed);
}

export async function getConfig(): Promise<config.Config> {
	const storeMan = await getStorageManager();
	const compressed = await storeMan.get();
	const decompressed = compression.decompressConfigFromString(compressed);
	return Promise.resolve(decompressed);
}
