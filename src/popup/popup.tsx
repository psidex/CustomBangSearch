import React from "react";
import ReactDOM from "react-dom/client";
import { Button, MantineProvider, Stack, Text, Title } from "@mantine/core";
import browser from "webextension-polyfill";

import MiscButtons from "../lib/components/MiscButtons";
import theme from "../lib/theme";
import { buildTime, hash, version } from "../lib/esbuilddefinitions";

function App(): React.ReactElement {
	return (
		<Stack align="center">
			<Title style={{ textAlign: "center" }}>Custom Bang Search</Title>
			<Text title={`${hash} @ ${buildTime}`}>v{version}</Text>
			<MiscButtons />
			<Button
				variant=""
				onClick={() => {
					browser.runtime.openOptionsPage();
				}}
			>
				Options
			</Button>
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
