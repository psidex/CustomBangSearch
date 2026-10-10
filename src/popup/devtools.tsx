import { Button, SimpleGrid, Stack, Text } from "@mantine/core";
import lz from "lz-string";
import React, { useState } from "react";
import browser from "webextension-polyfill";

import * as config from "../lib/config/config";
import defaultConfig from "../lib/config/default";
import * as compression from "../lib/config/storage/compression";
import { splitIntoChunks } from "../lib/config/storage/managers/chunks";
import * as storage from "../lib/config/storage/storage";

type StorageMethod = config.allowedStorageMethodsAsType;

// If an action returns a string, it is shown in the status line
type DevAction = {
	label: string;
	action: (method: StorageMethod) => Promise<unknown>;
};

function defaultConfigFor(method: StorageMethod): config.Config {
	const cfg = defaultConfig();
	cfg.options.storageMethod = method;
	return cfg;
}

// Stores a raw config string the same way the storage managers do, clears the
// other storage, and makes method the current storage method
async function storeRaw(method: StorageMethod, str: string): Promise<void> {
	await browser.storage.sync.clear();
	await browser.storage.local.remove("config");
	if (method === "sync") {
		await browser.storage.sync.set(splitIntoChunks(str));
	} else {
		await browser.storage.local.set({ config: str });
	}
	await browser.storage.local.set({ storageMethod: method });
}

// Creates the default config as a version 6 config would have stored it, with
// no version header, to test migrations
function v6ConfigString(method: StorageMethod): string {
	const { quickSearches, options, ...rest } = defaultConfigFor(method);
	const { ignoreKeywordCase, advancedMode: _, ...restOptions } = options;
	const v6 = {
		...rest,
		version: 6,
		options: { ...restOptions, ignoreBangCase: ignoreKeywordCase },
		bangs: quickSearches,
	};
	return lz.compressToUTF16(JSON.stringify(v6));
}

// Creates a config string with the given raw header, to test header parsing
function configStringWithHeader(method: StorageMethod, header: string): string {
	const cfg = { ...defaultConfigFor(method), version: Number(header) || 7 };
	return `\u0001${header}\u0001${lz.compressToUTF16(JSON.stringify(cfg))}`;
}

// The storage that storageActions write to
const devStorageMethod: StorageMethod = "sync";

// Actions that write to devStorageMethod
const storageActions: DevAction[] = [
	{
		label: "Default",
		action: async () => {
			await storage.storeConfig(defaultConfig());
			return "Stored default config";
		},
	},
	{
		label: "Corrupted",
		action: async (method) => {
			await storeRaw(method, "corrupt");
			return `Stored corrupted config in ${method}`;
		},
	},
	{
		label: "v6 config",
		action: async (method) => {
			await storeRaw(method, v6ConfigString(method));
			return `Stored v6 config (no header) in ${method}`;
		},
	},
	{
		label: "Version 999",
		action: async (method) => {
			await storeRaw(method, configStringWithHeader(method, "999"));
			return `Stored version 999 config in ${method}`;
		},
	},
	{
		label: "With malformed header",
		action: async (method) => {
			await storeRaw(method, configStringWithHeader(method, "abc"));
			return `Stored config with header "abc" in ${method}`;
		},
	},
	{
		label: "With mismatched local/sync method",
		action: async (method) => {
			const other = method === "sync" ? "local" : "sync";
			await storeRaw(
				method,
				compression.compressConfigToString(defaultConfigFor(method)),
			);
			await browser.storage.local.set({ storageMethod: other });
			return `Config in ${method}, storageMethod set to ${other}`;
		},
	},
];

const generalActions: DevAction[] = [
	{
		label: "Clear all storage",
		action: async () => {
			await browser.storage.sync.clear();
			await browser.storage.local.clear();
			return "sync & local cleared";
		},
	},
	{
		label: "Attempt oversized sync",
		action: async () => {
			// Stores a config too big for sync storage through the normal store
			// path, which should fail and rollback to the current config
			const current = await storage.getConfig();
			const huge = defaultConfigFor("sync");
			for (let i = 0; i < 2000; i++) {
				huge.quickSearches.push(
					config.newQuickSearch(`k${i}`, "", [
						`https://${crypto.randomUUID()}.com/?q=%s`,
					]),
				);
			}
			try {
				await storage.storeConfigAndStorageMethod(huge, current);
				return "Oversided store ran without error, which is unexpected";
			} catch (error) {
				const after = await storage.getConfig().then(
					(cfg) =>
						`config readable (${cfg.quickSearches.length} quick searches)`,
					(e) => `config unreadable: ${e}`,
				);
				return `Oversided store failed as expected: ${error}, ${after}`;
			}
		},
	},
	{
		label: "Dump sync, local, and current config to console",
		action: async () => {
			console.log("sync", await browser.storage.sync.get(null));
			console.log("local", await browser.storage.local.get(null));
			try {
				console.log("config", await storage.getConfigAndIfMigrated());
			} catch (error) {
				console.log("config error", error);
			}
			return "Dumped to the popup console";
		},
	},
	{
		label: "Reload extension",
		action: async () => {
			browser.runtime.reload();
		},
	},
];

export default function DevTools() {
	const [status, setStatus] = useState("");

	const renderButtons = (actions: DevAction[]) => (
		<SimpleGrid cols={2} spacing="xs" verticalSpacing="xs">
			{actions.map(({ label, action }) => (
				<Button
					key={label}
					size="compact-xs"
					variant="light"
					color="red"
					// Lets long labels wrap instead of being cut off. Grid rows
					// stretch, so buttons in the same row stay the same height
					h="auto"
					py={4}
					styles={{ label: { whiteSpace: "normal", textAlign: "center" } }}
					onClick={async () => {
						try {
							const result = await action(devStorageMethod);
							setStatus(typeof result === "string" ? result : `${label}: done`);
						} catch (error) {
							setStatus(`${label} failed: ${error}`);
						}
					}}
				>
					{label}
				</Button>
			))}
		</SimpleGrid>
	);

	return (
		<Stack className="devtools" gap="xs">
			<Text c="red" fw={700} size="sm">
				Dev Tools
			</Text>
			<Text size="xs" c="dimmed">
				Set config
			</Text>
			{renderButtons(storageActions)}
			<Text size="xs" c="dimmed">
				Actions
			</Text>
			{renderButtons(generalActions)}
			{status && (
				<Text size="xs" className="devtools-status">
					{status}
				</Text>
			)}
		</Stack>
	);
}
