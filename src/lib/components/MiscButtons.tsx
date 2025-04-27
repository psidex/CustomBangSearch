import React from "react";
import {
	ActionIcon,
	useMantineColorScheme,
	useComputedColorScheme,
	Flex,
} from "@mantine/core";
import { Bug, Moon, Sun } from "lucide-react";
import GitHubIcon from "./GithubIcon";

export default function MiscButtons() {
	const { setColorScheme } = useMantineColorScheme();
	const computedColorScheme = useComputedColorScheme("light");
	// TODO: Hints on hover as to what the buttons are (titles not actualy tooltips)
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
			>
				<GitHubIcon />
			</ActionIcon>
			<ActionIcon
				onClick={() => {
					// TODO: Issue template
					const w = window.open(
						"https://github.com/psidex/CustomBangSearch/issues/new",
						"_blank",
					);
					if (w) {
						w.focus();
					}
				}}
				variant="default"
				size="xl"
				style={{ marginRight: "1em" }}
			>
				<Bug />
			</ActionIcon>
		</Flex>
	);
}
