import React from "react";
import {
	ActionIcon,
	useMantineColorScheme,
	useComputedColorScheme,
	Flex,
} from "@mantine/core";
import { Moon, Sun } from "lucide-react";
import GitHubIcon from "./GithubIcon";

export default function MiscButtons() {
	const { setColorScheme } = useMantineColorScheme();
	const computedColorScheme = useComputedColorScheme("light");
	return (
		<Flex>
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
				onClick={() =>
					setColorScheme(computedColorScheme === "light" ? "dark" : "light")
				}
				variant="default"
				size="xl"
				aria-label="Toggle color scheme"
			>
				{computedColorScheme === "light" ? <Moon /> : <Sun />}
			</ActionIcon>
		</Flex>
	);
}
