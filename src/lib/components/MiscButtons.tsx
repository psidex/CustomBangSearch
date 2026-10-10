import {
	ActionIcon,
	Flex,
	useComputedColorScheme,
	useMantineColorScheme,
} from "@mantine/core";
import { Bug, Moon, Sun } from "lucide-react";
import React from "react";
import browser from "webextension-polyfill";

import * as esbuilddefinitions from "../esbuilddefinitions";

import GitHubIcon from "./GithubIcon";

async function newGitHubIssueUrl(): Promise<string> {
	const platformInfo = await browser.runtime.getPlatformInfo();

	const title = "[Bug] < YOUR TITLE >";

	const desc = `
Custom Quick Search:
- \`version\`: ${esbuilddefinitions.version}
- \`gitInfo\`: ${esbuilddefinitions.gitInfo}
- \`buildTime\`: ${esbuilddefinitions.buildTime}
- \`currentBrowser\`: ${esbuilddefinitions.currentBrowser}

Browser:
- OS: ${platformInfo.os}
- Arch: ${platformInfo.arch}

< DESCRIBE YOUR BUG HERE, please include as much information as possible and preferably a method to reproduce >
	`.trim();

	return `https://github.com/psidex/CustomQuickSearch/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(desc)}`;
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
				onClick={() =>
					window.open("https://github.com/psidex/CustomQuickSearch", "_blank")
				}
				variant="default"
				size="xl"
				style={{ marginRight: "1em" }}
				title="View source code"
			>
				<GitHubIcon />
			</ActionIcon>
			<ActionIcon
				onClick={async () => window.open(await newGitHubIssueUrl(), "_blank")}
				variant="default"
				size="xl"
				title="Report a bug"
			>
				<Bug />
			</ActionIcon>
		</Flex>
	);
}
