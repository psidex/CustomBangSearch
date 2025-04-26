import React, { useEffect, useState } from "react";
import { Title, Box, Group, Text, Stack } from "@mantine/core";
import browser from "webextension-polyfill";

import MiscButtons from "../../lib/components/MiscButtons";
import { currentBrowser } from "../../lib/esbuilddefinitions";

const BROWSER_QUOTA_BYTES_PER_ITEM =
	// @ts-ignore: The chrome namespace will be available if this check passes
	currentBrowser === "chrome" ? chrome.storage.sync.QUOTA_BYTES : 102400;

export default function ConfigHeader() {
	const [storedSize, setStoredSize] = useState<number>(0);

	useEffect(() => {
		const updateSize = () => {
			browser.storage.sync.getBytesInUse().then(setStoredSize);
		};
		updateSize();
		browser.storage.sync.onChanged.addListener(updateSize);
		return () => browser.storage.sync.onChanged.removeListener(updateSize);
	}, []);

	return (
		<Stack style={{ padding: "1em" }}>
			<Group style={{ justifyContent: "space-between" }}>
				<Title>Custom Bang Search</Title>
				<Box>
					<MiscButtons />
				</Box>
			</Group>
			<Text>
				{`Storing ${storedSize}/${BROWSER_QUOTA_BYTES_PER_ITEM} bytes (${(storedSize / (BROWSER_QUOTA_BYTES_PER_ITEM / 100)).toFixed(1)}%)`}
			</Text>
		</Stack>
	);
}
