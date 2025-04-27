import React, { type ChangeEvent, useState } from "react";
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
import { notifications } from "@mantine/notifications";

import {
	allowedStorageMethodsAsArray,
	type Options,
	type allowedStorageMethodsAsType,
} from "../../lib/config/config";
import {
	clearUnusedStorageManagers,
	getConfig,
	storeConfig,
	updateStorageManagerMethod,
} from "../../lib/config/storage/storage";
import { Check } from "lucide-react";
import { hostPermissionUrls } from "../../lib/esbuilddefinitions";

interface Props {
	initialOptions: Options;
}

export default function BangsTabPanel(props: Props) {
	const [triggerText, setTriggerText] = useState<string>(
		props.initialOptions.trigger,
	);

	const [storageMethod, setStorageMethod] =
		useState<allowedStorageMethodsAsType>(props.initialOptions.storageMethod);

	// Record<url, ignored>
	const [ignoredDomainsList, setIgnoredDomainsList] = useState<
		Record<string, boolean>
	>(
		Object.fromEntries(
			hostPermissionUrls.map((url) => [
				url,
				props.initialOptions.ignoredSearchDomains.includes(url),
			]),
		),
	);

	const [ignoreBangCase, setIgnoreBangCase] = useState<boolean>(
		props.initialOptions.ignoreBangCase,
	);

	const saveOptions = async () => {
		// TODO: Catch errs, display err notif
		const cfg = await getConfig();

		cfg.options.trigger = triggerText;
		cfg.options.storageMethod = storageMethod;
		cfg.options.ignoredSearchDomains = Object.keys(ignoredDomainsList).filter(
			(key) => ignoredDomainsList[key],
		);
		cfg.options.ignoreBangCase = ignoreBangCase;

		await updateStorageManagerMethod(storageMethod);
		await storeConfig(cfg);
		await clearUnusedStorageManagers();

		notifications.show({
			title: "Settings saved",
			message: "",
			autoClose: true,
			icon: <Check />,
			color: "green",
		});
	};

	const handleIgnoredSwitchChanged =
		(label: string) => (event: ChangeEvent<HTMLInputElement>) => {
			console.log(event);
			// We reverse the checked because the UI is showing "enabled", but the
			// code is dealing with disabled
			setIgnoredDomainsList((prev) => ({
				...prev,
				// NOTE: Not sure why currentTarget can't be used, but this works
				[label]: !event.target.checked,
			}));
		};

	return (
		<Stack>
			<Button
				style={{ width: "6em", margin: "1em 1em 0 1em" }}
				onClick={saveOptions}
				size="md"
				variant="default"
			>
				Save
			</Button>
			<Group>
				<Stack>
					<Title order={3}>Trigger</Title>
					<Text>
						The character(s) to trigger the extension, traditionally{" "}
						<Code>!</Code>
					</Text>
				</Stack>
				<Input
					value={triggerText}
					onChange={(e) => setTriggerText(e.target.value)}
				/>
			</Group>
			<Group>
				<Stack>
					<Title order={3}>Storage Method</Title>
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
				<SegmentedControl
					value={storageMethod}
					onChange={(v) => setStorageMethod(v as allowedStorageMethodsAsType)}
					data={allowedStorageMethodsAsArray}
				/>
			</Group>
			<Group>
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
			<Group>
				<Stack>
					<Title order={3}>Case Insensitive Bangs</Title>
					<Text>
						For example, if active, <Code>!a</Code> and <Code>!A</Code> will be
						equivalent
					</Text>
				</Stack>
				<Switch
					checked={ignoreBangCase}
					onChange={(e) => {
						setIgnoreBangCase(e.currentTarget.checked);
					}}
				/>
			</Group>
		</Stack>
	);
}
