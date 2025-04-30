import React from "react";
import {
	ActionIcon,
	useMantineColorScheme,
	useComputedColorScheme,
	Flex,
} from "@mantine/core";
import { Bug, Moon, Sun } from "lucide-react";
import browser from "webextension-polyfill";

import * as esbuilddefinitions from "../esbuilddefinitions";

import GitHubIcon from "./GithubIcon";

async function newGitHubIssueUrl(): Promise<string> {
	const platformInfo = await browser.runtime.getPlatformInfo();

	const title = "[Bug] < YOUR TITLE >";

	const desc = `
Custom Bang Search:
- \`version\`: ${esbuilddefinitions.version}
- \`hash\`: ${esbuilddefinitions.hash}
- \`buildTime\`: ${esbuilddefinitions.buildTime}
- \`currentBrowser\`: ${esbuilddefinitions.currentBrowser}

Browser:
- OS: ${platformInfo.os}
- Arch: ${platformInfo.arch}

< DESCRIBE YOUR BUG HERE, please include as much information as possible and preferably a method to reproduce >
	`.trim();

	return `https://github.com/psidex/CustomBangSearch/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(desc)}`;
}

export default function MiscButtons() {
	const { setColorScheme } = useMantineColorScheme();
	const computedColorScheme = useComputedColorScheme("light");
	return (
		<Flex>
			<ActionIcon
				onClick={() =>
					setColorScheme(computedColorScheme === "light" ? "dark" : "light")
				}
				variant="default"
				size="xl"
				aria-label="Toggle color scheme"
				style={{ marginRight: "1em" }}
				title="Switch colour theme"
			>
				{computedColorScheme === "light" ? <Moon /> : <Sun />}
			</ActionIcon>
			<ActionIcon
				onClick={() => {
					const w = window.open(
						"https://github.com/psidex/CustomBangSearch",
						"_blank",
					);
					if (w) {
						w.focus();
					}
				}}
				variant="default"
				size="xl"
				style={{ marginRight: "1em" }}
				title="View source code"
			>
				<GitHubIcon />
			</ActionIcon>
			<ActionIcon
				onClick={async () => {
					const w = window.open(await newGitHubIssueUrl(), "_blank");
					if (w) {
						w.focus();
					}
				}}
				variant="default"
				size="xl"
				title="Report a bug"
			>
				<Bug />
			</ActionIcon>
		</Flex>
	);
}
