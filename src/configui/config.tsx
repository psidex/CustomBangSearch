import React from "react";
import ReactDOM from "react-dom/client";
import { Image, MantineProvider, NavLink, Title } from "@mantine/core";
import { AppShell, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { CircleHelp, Cog } from "lucide-react";

import theme from "../lib/theme";

export function App() {
	const [opened, { toggle }] = useDisclosure();
	return (
		<AppShell
			header={{ height: 60 }}
			navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
			padding="md"
		>
			<AppShell.Header>
				<Group h="100%" px="md">
					<Title>Custom Bang Search Config</Title>
				</Group>
			</AppShell.Header>
			<AppShell.Navbar p="md">
				<NavLink
					label="Bangs"
					leftSection={
						<Image
							height={24}
							width={24}
							src="../../images/icons/icon_28.png"
						/>
					}
				/>
				<NavLink label="Options" leftSection={<Cog />} />
				<NavLink label="About" leftSection={<CircleHelp />} />
			</AppShell.Navbar>
			<AppShell.Main>Main</AppShell.Main>
		</AppShell>
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
