import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import {
	Tabs,
	MantineProvider,
	Image,
	Loader,
	Text,
	Group,
	Alert,
	Flex,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Notifications } from "@mantine/notifications";
import { CircleHelp, Cog, TriangleAlert } from "lucide-react";
import browser from "webextension-polyfill";

import BangsTabPanel from "./components/BangsTabPanel";
import HelpTabPanel from "./components/HelpTabPanel";
import OptionsTabPanel from "./components/OptionsTabPanel";
import ConfigHeader from "./components/ConfigHeader";

import theme from "../lib/theme";
import defaultConfig from "../lib/config/default";
import type * as config from "../lib/config/config";
import * as storage from "../lib/config/storage/storage";

async function waitForMainScript(timeout = 10_000): Promise<void> {
	const start = Date.now();
	while (Date.now() - start < timeout) {
		const { mainScriptInitialised } = await browser.storage.local.get(
			"mainScriptInitialised",
		);
		if (mainScriptInitialised) {
			return;
		}
		await new Promise((resolve) => setTimeout(resolve, 100));
	}
	throw new Error("Timeout waiting for main script to initialise");
}

export function App() {
	const [fatalError, setFatalError] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [initialConfig, setInitialConfig] = useState<config.Config>(
		defaultConfig(),
	);

	useEffect(() => {
		waitForMainScript()
			.then(() => storage.getConfig())
			.then(setInitialConfig)
			.catch((error) => {
				setFatalError(
					error instanceof Error ? error.message : "Error getting config",
				);
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	// TODO: Is there a better way to do this?
	const windowIsAtLeast1200 = useMediaQuery("(min-width: 1200px)");
	const windowIsAtLeast1600 = useMediaQuery("(min-width: 1600px)");
	const windowIsAtLeast2200 = useMediaQuery("(min-width: 2200px)");
	const widthPercent = windowIsAtLeast2200
		? "50%"
		: windowIsAtLeast1600
			? "70%"
			: windowIsAtLeast1200
				? "90%"
				: "100%";

	// TODO: Support thinner screens

	return (
		<Flex
			style={{
				width: widthPercent,
				margin: "auto",
				height: "100vh",
				flexDirection: "column",
			}}
		>
			<ConfigHeader storageMethod={initialConfig.options.storageMethod} />
			{(fatalError !== null && (
				<Alert variant="light" color="red" icon={<TriangleAlert />}>
					<Text>
						A fatal error occurred trying to load config: {fatalError}{" "}
					</Text>
					<Text>Please try reloading your browser</Text>
					<Text>
						This could be due to use of sync storage and a slow internet
						connection
					</Text>
				</Alert>
			)) || (
				<Tabs
					defaultValue="bangs"
					style={{ display: "flex", flexDirection: "column", height: "100%" }}
				>
					<Tabs.List>
						<Tabs.Tab
							value="bangs"
							leftSection={
								<Image
									height={24}
									width={24}
									src="../../images/icons/icon_28.png"
									// Stop a Mantine style overwriting it
									style={{ height: 24, width: 24 }}
								/>
							}
						>
							Bangs
						</Tabs.Tab>
						<Tabs.Tab value="options" leftSection={<Cog size={24} />}>
							Options
						</Tabs.Tab>
						<Tabs.Tab value="help" leftSection={<CircleHelp size={24} />}>
							Help
						</Tabs.Tab>
					</Tabs.List>
					{/* Style here required for internal styling to work */}
					<Tabs.Panel value="bangs" style={{ display: "flex", height: "100%" }}>
						{(loading && (
							<Group style={{ alignSelf: "flex-start" }}>
								<Loader style={{ margin: "2em" }} />
								<Text>Fetching bangs...</Text>
							</Group>
						)) || (
							<BangsTabPanel
								initialBangs={initialConfig.bangs}
								setInitialConfig={setInitialConfig}
								ignoreBangCase={initialConfig.options.ignoreBangCase}
							/>
						)}
					</Tabs.Panel>
					<Tabs.Panel value="options">
						{(loading && (
							<Group style={{ alignSelf: "flex-start" }}>
								<Loader style={{ margin: "2em" }} />
								<Text>Fetching options...</Text>
							</Group>
						)) || (
							<OptionsTabPanel
								initialOptions={initialConfig.options}
								setInitialConfig={setInitialConfig}
							/>
						)}
					</Tabs.Panel>
					<Tabs.Panel value="help">
						<HelpTabPanel />
					</Tabs.Panel>
				</Tabs>
			)}
		</Flex>
	);
}

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement,
);

root.render(
	<React.StrictMode>
		<MantineProvider defaultColorScheme="auto" theme={theme}>
			<Notifications containerWidth={300} position="top-center" />
			<App />
		</MantineProvider>
	</React.StrictMode>,
);
