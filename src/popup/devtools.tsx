import React from "react";
import { Stack, Button, Text } from "@mantine/core";
import browser from "webextension-polyfill";

import * as storage from "../lib/config/storage/storage";
import defaultConfig from "../lib/config/default";
import setLegacySettings from "../lib/config/legacy/debug";

export default function DevTools() {
	return (
		<Stack
			justify="center"
			gap="md"
			style={{
				borderColor: "red",
				borderWidth: "3px",
				borderStyle: "solid",
				padding: "10px",
			}}
		>
			<Text style={{ color: "red" }}>Dev Tools</Text>
			<Button
				onClick={async () => {
					await storage.storeConfig(defaultConfig());
				}}
			>
				Reset config to default
			</Button>
			<Button
				onClick={async () => {
					await browser.storage.sync.clear();
					await setLegacySettings();
				}}
			>
				Set legacy config
			</Button>
		</Stack>
	);
}
