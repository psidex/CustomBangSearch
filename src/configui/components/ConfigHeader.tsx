import React, { useEffect, useState } from "react";
import { Title, Box, Group, Text, Stack } from "@mantine/core";
import browser from "webextension-polyfill";

import MiscButtons from "../../lib/components/MiscButtons";
import { currentBrowser } from "../../lib/esbuilddefinitions";
import PermissionsRequester from "../../lib/components/PermissionsRequester";
import type { allowedStorageMethodsAsType } from "../../lib/config/config";

const BROWSER_QUOTA_BYTES_PER_ITEM =
	// @ts-ignore: The chrome namespace will be available if this check passes
	currentBrowser === "chrome" ? chrome.storage.sync.QUOTA_BYTES : 102400;

interface Props {
	storageMethod: allowedStorageMethodsAsType;
}

export default function ConfigHeader(props: Props) {
	const { storageMethod } = props;

	const [storedSizeSync, setStoredSizeSync] = useState<number>(0);
	const [storedSizeLocal, setStoredSizeLocal] = useState<number>(0);

	useEffect(() => {
		const updateSize = () => {
			browser.storage.sync.getBytesInUse().then(setStoredSizeSync);
		};
		updateSize();
		browser.storage.sync.onChanged.addListener(updateSize);
		return () => browser.storage.sync.onChanged.removeListener(updateSize);
	}, []);

	useEffect(() => {
		const updateSize = () => {
			// @ts-ignore: getBytesInUse is not in the type, but is implemented in
			// some browsers
			if (browser.storage.local.getBytesInUse) {
				// @ts-ignore: We check if the func exists first!
				browser.storage.local.getBytesInUse().then(setStoredSizeLocal);
			}
		};
		updateSize();
		browser.storage.local.onChanged.addListener(updateSize);
		return () => browser.storage.local.onChanged.removeListener(updateSize);
	}, []);

	// TODO: Use nicely formatted text for the byte numbers

	return (
		<Stack style={{ padding: "1em" }}>
			<Group style={{ justifyContent: "space-between" }}>
				<Title>Custom Bang Search</Title>
				<PermissionsRequester />
				<Box>
					<MiscButtons />
				</Box>
			</Group>
			<Text>
				{storageMethod === "sync" &&
					`Using ${(storedSizeSync / (BROWSER_QUOTA_BYTES_PER_ITEM / 100)).toFixed(1)}% (${storedSizeSync}/${BROWSER_QUOTA_BYTES_PER_ITEM} bytes) of sync storage`}
				{storageMethod === "local" &&
					storedSizeLocal > 0 &&
					`Using ${storedSizeLocal} bytes of local storage`}
				{storageMethod === "local" &&
					storedSizeLocal === 0 &&
					"Using local storage"}
			</Text>
		</Stack>
	);
}
