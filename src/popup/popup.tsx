import React from "react";
import ReactDOM from "react-dom/client";
import {
	Button,
	MantineProvider,
	Stack,
	Text,
	Title,
	Tooltip,
} from "@mantine/core";
import browser from "webextension-polyfill";

import MiscButtons from "../lib/components/MiscButtons";
import theme from "../lib/theme";
import * as esbuilddefinitions from "../lib/esbuilddefinitions";
import PermissionsRequester from "../lib/components/PermissionsRequester";

import DevTools from "./devtools";

function App(): React.ReactElement {
	return (
		<Stack align="center">
			<Title style={{ textAlign: "center", fontSize: "1.9rem" }}>
				Custom Bang Search
			</Title>
			<Tooltip
				label={`${esbuilddefinitions.hash} @ ${esbuilddefinitions.buildTime}`}
			>
				<Text>v{esbuilddefinitions.version}</Text>
			</Tooltip>
			<MiscButtons />
			<Button
				variant="default"
				onClick={() => {
					browser.runtime.openOptionsPage();
				}}
			>
				Options
			</Button>
			<PermissionsRequester />
			{esbuilddefinitions.inDev && <DevTools />}
		</Stack>
	);
}

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement,
);

root.render(
	<React.StrictMode>
		<MantineProvider defaultColorScheme="auto" theme={theme}>
			<App />
		</MantineProvider>
	</React.StrictMode>,
);

if (esbuilddefinitions.inDev) {
	// Open config page when popup is clicked, easier for testing
	document.addEventListener("DOMContentLoaded", () => {
		browser.runtime.openOptionsPage();
	});
}
