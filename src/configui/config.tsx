import React from "react";
import ReactDOM from "react-dom/client";
import { Tabs, MantineProvider, Title, Image, Box, Group } from "@mantine/core";
import { CircleHelp, Cog } from "lucide-react";
import { useMediaQuery } from "@mantine/hooks";

import theme from "../lib/theme";
import BangsTabPanel from "./components/BangsTabPanel";
import AboutTabPanel from "./components/AboutTabPanel";
import OptionsTabPanel from "./components/OptionsTabPanel";
import ConfigHeader from "./components/ConfigHeader";

export function App() {
	// TODO: Is there a better way to do this?
	const windowIsAtLeast1200 = useMediaQuery("(min-width: 1200px)");
	const windowIsAtLeast1600 = useMediaQuery("(min-width: 1600px)");
	const windowIsAtLeast2200 = useMediaQuery("(min-width: 2200px)");
	const widthPercent = windowIsAtLeast2200
		? "40%"
		: windowIsAtLeast1600
			? "60%"
			: windowIsAtLeast1200
				? "80%"
				: "100%";
	return (
		<Box style={{ width: widthPercent, margin: "auto" }}>
			<ConfigHeader />
			<Tabs defaultValue="bangs">
				<Tabs.List>
					<Tabs.Tab
						value="bangs"
						leftSection={
							<Image
								height={24}
								width={24}
								src="../../images/icons/icon_28.png"
							/>
						}
					>
						Bangs
					</Tabs.Tab>
					<Tabs.Tab value="options" leftSection={<Cog size={24} />}>
						Options
					</Tabs.Tab>
					<Tabs.Tab value="about" leftSection={<CircleHelp size={24} />}>
						About
					</Tabs.Tab>
				</Tabs.List>
				<Tabs.Panel value="bangs">
					<BangsTabPanel />
				</Tabs.Panel>
				<Tabs.Panel value="options">
					<OptionsTabPanel />
				</Tabs.Panel>
				<Tabs.Panel value="about">
					<AboutTabPanel />
				</Tabs.Panel>
			</Tabs>
		</Box>
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
