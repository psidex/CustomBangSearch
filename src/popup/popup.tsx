import {
	Button,
	MantineProvider,
	Stack,
	Text,
	Title,
	Tooltip,
} from "@mantine/core";
import React from "react";
import ReactDOM from "react-dom/client";
import browser from "webextension-polyfill";

import MiscButtons from "../lib/components/MiscButtons";
import PermissionsRequester from "../lib/components/PermissionsRequester";
import * as esbuilddefinitions from "../lib/esbuilddefinitions";
import theme from "../lib/theme";

import DevTools from "./devtools";

function App(): React.ReactElement {
	return (
		<Stack align="center">
			<Title style={{ textAlign: "center", fontSize: "1.9rem" }}>
				Custom Quick Search
			</Title>
			<Tooltip
				label={`${esbuilddefinitions.gitInfo} @ ${esbuilddefinitions.buildTime}`}
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
