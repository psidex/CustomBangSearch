import { Button, Stack, Text } from "@mantine/core";
import React from "react";
import browser from "webextension-polyfill";
import defaultConfig from "../lib/config/default";
import setLegacySettings from "../lib/config/legacy/debug";
import * as storage from "../lib/config/storage/storage";

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
