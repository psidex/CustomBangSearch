import React, {
	type ChangeEvent,
	type Dispatch,
	type SetStateAction,
	useEffect,
	useState,
} from "react";
import {
	Stack,
	Title,
	Text,
	Group,
	Switch,
	Input,
	SegmentedControl,
	Code,
	Anchor,
	Button,
} from "@mantine/core";
import { Check, RotateCcw, Save, X } from "lucide-react";
import { notifications } from "@mantine/notifications";

import * as config from "../../lib/config/config";
import * as storage from "../../lib/config/storage/storage";
import { hostPermissionUrls } from "../../lib/esbuilddefinitions";
import defaultConfig from "../../lib/config/default";

interface Props {
	initialOptions: config.Options;
	setInitialConfig: Dispatch<SetStateAction<config.Config>>;
}

export default function BangsTabPanel(props: Props) {
	const { initialOptions, setInitialConfig } = props;

	const [needToSave, setNeedToSave] = useState(false);

	const [triggerText, setTriggerText] = useState<string>(
		initialOptions.trigger,
	);

	const [storageMethod, setStorageMethod] =
		useState<config.allowedStorageMethodsAsType>(initialOptions.storageMethod);

	// Record<url, ignored>
	const [ignoredDomainsList, setIgnoredDomainsList] = useState<
		Record<string, boolean>
	>(
		Object.fromEntries(
			hostPermissionUrls.map((url) => [
				url,
				initialOptions.ignoredSearchDomains.includes(url),
			]),
		),
	);

	const [ignoreBangCase, setIgnoreBangCase] = useState<boolean>(
		initialOptions.ignoreBangCase,
	);

	function ignoredDomainsListAsArray(): Array<string> {
		return Object.keys(ignoredDomainsList).filter(
			(key) => ignoredDomainsList[key],
		);
	}

	// The vaule of the variable ignoredDomainsListAsArray does not indicate if we
	// have something to save or not, dont include in effect deps
	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		setNeedToSave(
			initialOptions.trigger !== triggerText ||
				initialOptions.storageMethod !== storageMethod ||
				initialOptions.ignoredSearchDomains.length !==
					ignoredDomainsListAsArray().length ||
				initialOptions.ignoreBangCase !== ignoreBangCase,
		);
	}, [
		initialOptions,
		triggerText,
		storageMethod,
		ignoredDomainsList,
		ignoreBangCase,
	]);

	const saveOptions = async () => {
		const notifId = notifications.show({
			title: "Saving options...",
			message: "",
			loading: true,
			autoClose: false,
			withCloseButton: false,
		});

		let cfg: config.Config;
		try {
			cfg = await storage.getConfig();

			cfg.options.trigger = triggerText;
			cfg.options.storageMethod = storageMethod;
			cfg.options.ignoredSearchDomains = ignoredDomainsListAsArray();
			cfg.options.ignoreBangCase = ignoreBangCase;

			await storage.updateStorageManagerMethod(storageMethod);
			await storage.storeConfig(cfg);
			await storage.clearUnusedStorageManagers();
		} catch (error) {
			notifications.update({
				id: notifId,
				title: "Failed to save options",
				message: error instanceof Error ? error.message : "",
				autoClose: true,
				icon: <X />,
				color: "red",
				loading: false,
			});
			return;
		}

		setNeedToSave(false);
		setInitialConfig(cfg);

		notifications.update({
			id: notifId,
			title: "Options saved",
			message: "",
			autoClose: true,
			icon: <Check />,
			color: "green",
			loading: false,
		});
	};

	const resetToDefault = () => {
		const defaultCfg = defaultConfig();
		setTriggerText(defaultCfg.options.trigger);
		setStorageMethod(defaultCfg.options.storageMethod);
		setIgnoredDomainsList(
			Object.fromEntries(
				hostPermissionUrls.map((url) => [
					url,
					defaultCfg.options.ignoredSearchDomains.includes(url),
				]),
			),
		);
		setIgnoreBangCase(defaultCfg.options.ignoreBangCase);
	};

	const handleIgnoredSwitchChanged =
		(label: string) => (event: ChangeEvent<HTMLInputElement>) => {
			// We reverse the checked because the UI is showing "enabled", but the
			// code is dealing with disabled
			setIgnoredDomainsList((prev) => ({
				...prev,
				// NOTE: Not sure why currentTarget can't be used, but this works
				[label]: !event.target.checked,
			}));
		};

	return (
		<Stack style={{ marginBottom: "5em" }}>
			<Group style={{ margin: "1em 1em 0 1em" }}>
				<Button
					onClick={saveOptions}
					size="md"
					variant={needToSave ? "filled" : "default"}
					color={needToSave ? "green" : ""}
					title="Save changes"
				>
					<Save style={{ marginRight: "0.5em" }} /> Save
				</Button>
				<Button
					onClick={resetToDefault}
					size="md"
					variant="default"
					title="Reset your options to the default values"
				>
					<RotateCcw style={{ marginRight: "0.5em" }} /> Reset to Default
				</Button>
			</Group>
			<Stack style={{ marginTop: "1em" }}>
				<Group>
					<Title order={3}>Trigger</Title>
					<Input
						size="md"
						value={triggerText}
						onChange={(e) => setTriggerText(e.target.value)}
					/>
				</Group>
				<Text>
					The character(s) to trigger the extension, traditionally a{" "}
					<Anchor
						href="https://en.wikipedia.org/wiki/Exclamation_mark"
						target="_blank"
					>
						bang
					</Anchor>
				</Text>
			</Stack>
			<Stack style={{ marginTop: "1em" }}>
				<Group>
					<Title order={3}>Storage Method</Title>
					<SegmentedControl
						value={storageMethod}
						onChange={(v) =>
							setStorageMethod(v as config.allowedStorageMethodsAsType)
						}
						data={config.allowedStorageMethodsAsArray}
					/>
				</Group>
				<Text w={350}>
					The storage method for config, <Code>sync</Code> uses your browsers{" "}
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
			</Stack>
			<Stack style={{ marginTop: "1em" }}>
				<Group>
					<Title order={3}>Case Insensitive Bangs</Title>
					<Switch
						checked={ignoreBangCase}
						onChange={(e) => {
							setIgnoreBangCase(e.currentTarget.checked);
						}}
					/>
				</Group>
				<Text>
					For example, if active, the bangs <Code>a</Code> and <Code>A</Code>{" "}
					will be equivalent
				</Text>
			</Stack>
			<Group style={{ marginTop: "1em" }}>
				<Stack>
					<Title order={3}>Enabled Domains</Title>
					<Text>Search engine domains that this extension will trigger on</Text>
					{hostPermissionUrls.map((label) => (
						<Switch
							key={label}
							label={label}
							// We swap the checked because we are showing if it's enabled, but
							// the bool is if its disabled
							checked={!ignoredDomainsList[label]}
							onChange={handleIgnoredSwitchChanged(label)}
						/>
					))}
				</Stack>
			</Group>
		</Stack>
	);
}
