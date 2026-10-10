import browser from "webextension-polyfill";

import * as config from "../config";

import * as compression from "./compression";
import LocalStorageManager from "./managers/local";
import type StorageManager from "./managers/manager";
import SyncStorageManager from "./managers/sync";

// NOTE: Defaulting to sync is important because it means if someone is using a
// new browser instance, we will auto fetch their stuff stored in sync
const defaultStorageMethod = "sync";

const storageManagers: Record<
	config.allowedStorageMethodsAsType,
	StorageManager
> = {
	sync: SyncStorageManager,
	local: LocalStorageManager,
};

// The current storage method is stored in local storage under this key. This
// is the source of truth, not the storageMethod in the stored config, which
// can't be read without knowing the storage method
async function getStorageManagerMethod(): Promise<config.allowedStorageMethodsAsType> {
	const { storageMethod } = await browser.storage.local.get("storageMethod");
	return (
		config.allowedStorageMethodsAsArray.find(
			(method) => method === storageMethod,
		) ?? defaultStorageMethod
	);
}

async function getStorageManager(): Promise<StorageManager> {
	return storageManagers[await getStorageManagerMethod()];
}

/**
 * Stores a config using the storage method in its options, making that the
 * current storage method, then clears all other storage managers. The current
 * storage method is only changed once the config has been stored, so if
 * storing fails the previous storage method and its data are kept.
 * @param cfg The new config to store.
 * @param rollback The config to rollback to if storing fails and the storage
 *                 method is unchanged, see `storeConfigWithRollback`.
 * @throws Error if compression or storing fails.
 */
export async function storeConfigAndStorageMethod(
	cfg: config.Config,
	rollback: config.Config,
): Promise<void> {
	const method = cfg.options.storageMethod;
	if (method === (await getStorageManagerMethod())) {
		await storeConfigWithRollback(cfg, rollback);
	} else {
		const storeMan = storageManagers[method];
		try {
			await storeMan.set(compression.compressConfigToString(cfg));
		} catch (error) {
			await storeMan.clear();
			throw error;
		}
		await browser.storage.local.set({ storageMethod: method });
	}

	for (const [otherMethod, storeMan] of Object.entries(storageManagers)) {
		if (otherMethod !== method) {
			await storeMan.clear();
		}
	}
}

/**
 * The same as `getConfig`, but also returns whether the config was migrated,
 * in which case it should be stored.
 * @returns The stored config, and whether it was migrated.
 * @throws See `getConfig`.
 */
export async function getConfigAndIfMigrated(): Promise<{
	cfg: config.Config;
	migrated: boolean;
}> {
	const method = await getStorageManagerMethod();
	const compressed = await storageManagers[method].get();
	const cfg = compression.decompressConfigFromString(compressed);
	cfg.options.storageMethod = method;
	return { cfg, migrated: !compression.isCurrentVersion(compressed) };
}

/**
 * Gets the config from the current storage manager, migrating it to the
 * current config version if required. The migrated config is not stored.
 * options.storageMethod is set to the current storage method.
 * @returns The stored config.
 * @throws NewerConfigVersionError if the config is from a newer version.
 * @throws Error if nothing is stored, or the storage manager, decompression or
 *         migration fails.
 */
export async function getConfig(): Promise<config.Config> {
	return (await getConfigAndIfMigrated()).cfg;
}

/**
 * Checks if the current storage manager has nothing stored, e.g. on a fresh
 * install.
 * @returns True if nothing is stored.
 */
export async function isConfigEmpty(): Promise<boolean> {
	const storeMan = await getStorageManager();
	return storeMan.isEmpty();
}

/**
 * The key in local storage used to tell the config UI that the stored config
 * could not be read and was reset to the default. The value is the error
 * message.
 */
export const configResetErrorKey = "configResetError";

/**
 * The same as `storeConfig`, but takes a config to rollback to if an error is
 * encountered when trying to store the new config. StorageManagers are not
 * guaranteed to be transactional, so to ensure we don't store corrupt data, we
 * need to be able to rollback to a good version.
 * @param cfg The new config to store.
 * @param rollback The config to rollback to if an error is encountered.
 * @throws Error if compression or storing fails. If storing the rollback also
 *         fails, that error is thrown instead and the stored data may be
 *         corrupt.
 */
export async function storeConfigWithRollback(
	cfg: config.Config,
	rollback: config.Config,
): Promise<void> {
	try {
		await storeConfig(cfg);
	} catch (error) {
		await storeConfig(rollback);
		throw error;
	}
}

/**
 * Store a config in the current storage manager.
 * @param cfg The new config to store.
 * @throws Error if compression or storing fails.
 */
export async function storeConfig(cfg: config.Config): Promise<void> {
	const storeMan = await getStorageManager();
	return storeMan.set(compression.compressConfigToString(cfg));
}
