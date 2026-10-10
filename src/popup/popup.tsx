import {
	Alert,
	Button,
	MantineProvider,
	Stack,
	Text,
	Title,
	Tooltip,
} from "@mantine/core";
import { TriangleAlert } from "lucide-react";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import browser from "webextension-polyfill";

import MiscButtons from "../lib/components/MiscButtons";
import PermissionsRequester from "../lib/components/PermissionsRequester";
import { getConfigProblem } from "../lib/config/problems";
import * as esbuilddefinitions from "../lib/esbuilddefinitions";
import theme from "../lib/theme";

import DevTools from "./devtools";

function App(): React.ReactElement {
	const [configProblem, setConfigProblem] = useState<string | null>(null);

	useEffect(() => {
		getConfigProblem()
			.then(setConfigProblem)
			.catch((error) => {
				console.error("Failed to check config:", error);
			});
	}, []);

	return (
		<Stack align="center">
			{configProblem !== null && (
				<Alert
					variant="light"
					color="red"
					icon={<TriangleAlert />}
					title="Config problem"
				>
					<Text size="sm">{configProblem}</Text>
					<Text size="sm">See the options page for more details.</Text>
				</Alert>
			)}
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
