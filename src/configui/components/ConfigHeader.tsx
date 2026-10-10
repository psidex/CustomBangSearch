/** biome-ignore-all lint/suspicious/noTsIgnore: needed for browser stuff */

import { Box, Group, Stack, Text, Title } from "@mantine/core";
import React, { useEffect, useState } from "react";
import browser from "webextension-polyfill";

import MiscButtons from "../../lib/components/MiscButtons";
import PermissionsRequester from "../../lib/components/PermissionsRequester";
import type { allowedStorageMethodsAsType } from "../../lib/config/config";
import { MAX_TOTAL_SIZE_BYTES } from "../../lib/config/storage/managers/chunks";

interface Props {
	storageMethod: allowedStorageMethodsAsType;
}

export default function ConfigHeader(props: Props) {
	const { storageMethod } = props;

	const [storedSize, setStoredSize] = useState<number>(0);

	useEffect(() => {
		const area = browser.storage[storageMethod];
		const updateSize = () => {
			// @ts-ignore: getBytesInUse is not in the type for local storage, but
			// is implemented in some browsers
			area.getBytesInUse?.().then(setStoredSize);
		};
		setStoredSize(0);
		updateSize();
		area.onChanged.addListener(updateSize);
		return () => area.onChanged.removeListener(updateSize);
	}, [storageMethod]);

	// TODO: Use nicely formatted text for the byte numbers

	return (
		<Stack style={{ padding: "1em" }}>
			<Group style={{ justifyContent: "space-between" }}>
				<Title>Custom Quick Search</Title>
				<PermissionsRequester />
				<Box>
					<MiscButtons />
				</Box>
			</Group>
			<Text>
				{storageMethod === "sync"
					? `Using ${(storedSize / (MAX_TOTAL_SIZE_BYTES / 100)).toFixed(1)}% (${storedSize}/${MAX_TOTAL_SIZE_BYTES} bytes) of sync storage`
					: storedSize > 0
						? `Using ${storedSize} bytes of local storage`
						: "Using local storage"}
			</Text>
		</Stack>
	);
}
