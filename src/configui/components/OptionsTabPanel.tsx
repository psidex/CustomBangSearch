import {
	Anchor,
	Code,
	Group,
	Input,
	SegmentedControl,
	Stack,
	Switch,
	Text,
	Title,
} from "@mantine/core";
import { RotateCcw, Save } from "lucide-react";
import React, { type ReactNode, useState } from "react";

import * as config from "../../lib/config/config";
import defaultConfig from "../../lib/config/default";
import * as storage from "../../lib/config/storage/storage";
import { hostPermissionUrls } from "../../lib/esbuilddefinitions";
import { saveWithNotif } from "../notifications";
import ToolbarButton from "./ToolbarButton";

interface Props {
	initialOptions: config.Options;
	setInitialConfig: (cfg: config.Config) => void;
}

// A titled option, with its control next to the title and its description
// (children) below
function Setting(props: {
	title: string;
	control: ReactNode;
	children: ReactNode;
}) {
	return (
		<Stack style={{ marginTop: "1em" }}>
			<Group>
				<Title order={3}>{props.title}</Title>
				{props.control}
			</Group>
			{props.children}
		</Stack>
	);
}

// Only the domains this extension has permissions for are shown, and saved,
// kept in the same order as hostPermissionUrls
function onlyShownDomains(options: config.Options): config.Options {
	return {
		...options,
		ignoredSearchDomains: hostPermissionUrls.filter((url) =>
			options.ignoredSearchDomains.includes(url),
		),
	};
}

export default function OptionsTabPanel(props: Props) {
	const { initialOptions, setInitialConfig } = props;

	const [options, setOptions] = useState(() =>
		onlyShownDomains(initialOptions),
	);

	const setOption = <K extends keyof config.Options>(
		key: K,
		value: config.Options[K],
	) => {
		setOptions((prev) => ({ ...prev, [key]: value }));
	};

	const setDomainEnabled = (domain: string, enabled: boolean) => {
		setOptions((prev) =>
			onlyShownDomains({
				...prev,
				ignoredSearchDomains: enabled
					? prev.ignoredSearchDomains.filter((url) => url !== domain)
					: [...prev.ignoredSearchDomains, domain],
			}),
		);
	};

	const needToSave =
		initialOptions.trigger !== options.trigger ||
		initialOptions.storageMethod !== options.storageMethod ||
		initialOptions.ignoredSearchDomains.length !==
			options.ignoredSearchDomains.length ||
		options.ignoredSearchDomains.some(
			(domain) => !initialOptions.ignoredSearchDomains.includes(domain),
		) ||
		initialOptions.ignoreKeywordCase !== options.ignoreKeywordCase;

	const saveOptions = () =>
		saveWithNotif("options", async () => {
			// An empty trigger would make the first word of every search a keyword,
			// and the trigger is matched up to the next whitespace
			if (options.trigger === "" || /\s/.test(options.trigger)) {
				throw new Error("The trigger must not be empty or contain spaces");
			}

			const cfg = await storage.getConfig();
			const rollback = structuredClone(cfg);
			// Advanced mode is toggled and saved on the quick searches tab, so don't
			// overwrite it with the value from when this tab was loaded
			const { advancedMode: _, ...editedOptions } = options;
			cfg.options = { ...cfg.options, ...editedOptions };

			await storage.storeConfigAndStorageMethod(cfg, rollback);

			setInitialConfig(cfg);
		});

	const resetToDefault = () => {
		setOptions(onlyShownDomains(defaultConfig().options));
	};

	return (
		<Stack style={{ marginBottom: "2em" }}>
			<Group style={{ margin: "1em 1em 0 1em" }}>
				<ToolbarButton
					icon={Save}
					label="Save"
					title="Save changes"
					onClick={saveOptions}
					highlight={needToSave}
				/>
				<ToolbarButton
					icon={RotateCcw}
					label="Reset to Default"
					title="Reset your options to the default values"
					onClick={resetToDefault}
				/>
			</Group>
			<Setting
				title="Trigger"
				control={
					<Input
						size="md"
						value={options.trigger}
						onChange={(e) => setOption("trigger", e.target.value)}
					/>
				}
			>
				<Text>
					The character(s) to trigger the extension, traditionally a{" "}
					<Anchor
						href="https://en.wikipedia.org/wiki/Exclamation_mark"
						target="_blank"
					>
						bang
					</Anchor>
				</Text>
			</Setting>
			<Setting
				title="Storage Method"
				control={
					<SegmentedControl
						value={options.storageMethod}
						onChange={(v) =>
							setOption(
								"storageMethod",
								v as config.allowedStorageMethodsAsType,
							)
						}
						data={[...config.allowedStorageMethodsAsArray]}
					/>
				}
			>
				<Text w={350}>
					The storage method for config, <Code>sync</Code> uses your browser's{" "}
					<Anchor
						href="https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/sync"
						target="_blank"
					>
						sync storage
					</Anchor>
					, <Code>local</Code> uses{" "}
					<Anchor
						href="https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/local"
						target="_blank"
					>
						local storage
					</Anchor>
				</Text>
			</Setting>
			<Setting
				title="Case Insensitive Keywords"
				control={
					<Switch
						checked={options.ignoreKeywordCase}
						onChange={(e) =>
							setOption("ignoreKeywordCase", e.currentTarget.checked)
						}
					/>
				}
			>
				<Text>
					For example, if active, the keywords <Code>a</Code> and <Code>A</Code>{" "}
					will be equivalent
				</Text>
			</Setting>
			<Group style={{ marginTop: "1em" }}>
				<Stack>
					<Title order={3}>Enabled Domains</Title>
					<Text>Search engine domains that this extension will trigger on</Text>
					{hostPermissionUrls.map((domain) => (
						<Switch
							key={domain}
							label={domain}
							checked={!options.ignoredSearchDomains.includes(domain)}
							onChange={(e) =>
								setDomainEnabled(domain, e.currentTarget.checked)
							}
						/>
					))}
				</Stack>
			</Group>
		</Stack>
	);
}
