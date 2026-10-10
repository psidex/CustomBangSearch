import {
	Alert,
	Button,
	Flex,
	Group,
	Image,
	Loader,
	MantineProvider,
	Tabs,
	Text,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Notifications } from "@mantine/notifications";
import { CircleHelp, Cog, RotateCcw, TriangleAlert } from "lucide-react";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import browser from "webextension-polyfill";
import type * as config from "../lib/config/config";
import defaultConfig from "../lib/config/default";
import { NewerConfigVersionError } from "../lib/config/migrations";
import * as storage from "../lib/config/storage/storage";
import theme from "../lib/theme";
import ConfigHeader from "./components/ConfigHeader";
import HelpTabPanel from "./components/HelpTabPanel";
import OptionsTabPanel from "./components/OptionsTabPanel";
import QuickSearchesTabPanel from "./components/QuickSearchesTabPanel";
import { errorNotif, successNotif } from "./notifications";

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

function Loading({ what }: { what: string }) {
	return (
		<Group style={{ alignSelf: "flex-start" }}>
			<Loader style={{ margin: "2em" }} />
			<Text>Fetching {what}...</Text>
		</Group>
	);
}

export function App() {
	const [fatalError, setFatalError] = useState<Error | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [initialConfig, setInitialConfig] = useState<config.Config>(
		defaultConfig(),
	);

	const [configResetError, setConfigResetError] = useState<string | null>(null);

	const dismissConfigResetError = () => {
		setConfigResetError(null);
		browser.storage.local.remove(storage.configResetErrorKey);
	};

	const [resetting, setResetting] = useState<boolean>(false);

	const resetConfigToDefault = async () => {
		if (
			!window.confirm(
				"This will permanently delete your saved quick searches and options. Continue?",
			)
		) {
			return;
		}
		setResetting(true);
		try {
			await storage.storeConfig(defaultConfig());
			// Get the config back so options.storageMethod is set correctly
			setInitialConfig(await storage.getConfig());
			setFatalError(null);
			successNotif("Config reset", "Your config has been reset to the default");
		} catch (error) {
			errorNotif(
				"Failed to reset config",
				error instanceof Error ? error.message : "",
			);
		} finally {
			setResetting(false);
		}
	};

	// Advanced mode is a display preference, so it is saved as soon as it is
	// toggled, without saving any other unsaved changes
	const setAdvancedMode = async (advancedMode: boolean) => {
		try {
			const cfg = await storage.getConfig();
			const rollback = structuredClone(cfg);
			cfg.options.advancedMode = advancedMode;
			await storage.storeConfigWithRollback(cfg, rollback);
			// Only update advancedMode, so the quick searches aren't re-sorted
			setInitialConfig((prev) => ({
				...prev,
				options: { ...prev.options, advancedMode },
			}));
		} catch (error) {
			errorNotif(
				"Failed to save advanced mode",
				error instanceof Error ? error.message : "",
			);
		}
	};

	useEffect(() => {
		waitForMainScript()
			.then(async () => {
				const { [storage.configResetErrorKey]: resetError } =
					await browser.storage.local.get(storage.configResetErrorKey);
				if (typeof resetError === "string") {
					setConfigResetError(resetError);
				}
			})
			.then(() => storage.getConfig())
			.then(setInitialConfig)
			.catch((error) => {
				setFatalError(
					error instanceof Error ? error : new Error("Error getting config"),
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
			{configResetError !== null && (
				<Alert
					variant="light"
					color="orange"
					icon={<TriangleAlert />}
					// Stop the flex column shrinking it, which cuts off its bottom padding
					style={{ flexShrink: 0 }}
					title={
						<Group justify="space-between" style={{ flex: 1 }}>
							Your config has been reset
							<Button
								variant="filled"
								color="orange"
								size="compact-sm"
								onClick={dismissConfigResetError}
							>
								DISMISS
							</Button>
						</Group>
					}
				>
					<Text>
						Your saved quick searches and options could not be read, so they
						have been reset to the defaults.
					</Text>
					<Text>
						If you have an exported JSON file, you can import it on the Quick
						Searches tab.
					</Text>
					<Text>Error: {configResetError}</Text>
				</Alert>
			)}
			{fatalError !== null ? (
				<Alert variant="light" color="red" icon={<TriangleAlert />}>
					<Text>A fatal error occurred trying to load config: </Text>{" "}
					<Text>{fatalError.message}</Text>
					{!(fatalError instanceof NewerConfigVersionError) && (
						<>
							<Text>Please try reloading your browser</Text>
							<Text>
								This could be due to use of sync storage and a slow internet
								connection
							</Text>
						</>
					)}
					<Button
						mt="md"
						color="red"
						leftSection={<RotateCcw size={18} />}
						loading={resetting}
						onClick={resetConfigToDefault}
					>
						Reset config to default
					</Button>
				</Alert>
			) : (
				<Tabs
					defaultValue="quickSearches"
					style={{ display: "flex", flexDirection: "column", height: "100%" }}
				>
					<Tabs.List>
						<Tabs.Tab
							value="quickSearches"
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
							Quick Searches
						</Tabs.Tab>
						<Tabs.Tab value="options" leftSection={<Cog size={24} />}>
							Options
						</Tabs.Tab>
						<Tabs.Tab value="help" leftSection={<CircleHelp size={24} />}>
							Help
						</Tabs.Tab>
					</Tabs.List>
					{/* Style here required for internal styling to work */}
					<Tabs.Panel
						value="quickSearches"
						style={{ display: "flex", height: "100%" }}
					>
						{loading ? (
							<Loading what="quick searches" />
						) : (
							<QuickSearchesTabPanel
								initialQuickSearches={initialConfig.quickSearches}
								setInitialConfig={setInitialConfig}
								ignoreKeywordCase={initialConfig.options.ignoreKeywordCase}
								advancedMode={initialConfig.options.advancedMode}
								setAdvancedMode={setAdvancedMode}
							/>
						)}
					</Tabs.Panel>
					<Tabs.Panel value="options">
						{loading ? (
							<Loading what="options" />
						) : (
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
