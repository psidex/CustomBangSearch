import React from "react";
import ReactDOM from "react-dom/client";
import { Button, MantineProvider, Stack, Text, Title } from "@mantine/core";
import browser from "webextension-polyfill";

import MiscButtons from "../lib/components/MiscButtons";
import theme from "../lib/theme";
import { buildTime, hash, inDev, version } from "../lib/esbuilddefinitions";
import DevTools from "./devtools";

function App(): React.ReactElement {
	return (
		<Stack align="center">
			<Title style={{ textAlign: "center", fontSize: "1.9rem" }}>
				Custom Bang Search
			</Title>
			<Text title={`${hash} @ ${buildTime}`}>v{version}</Text>
			<MiscButtons />
			<Button
				variant="default"
				onClick={() => {
					browser.runtime.openOptionsPage();
				}}
			>
				Options
			</Button>
			{inDev && <DevTools />}
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
