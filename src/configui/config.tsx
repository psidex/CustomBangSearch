import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider, Title } from "@mantine/core";

import MiscButtons from "../lib/components/MiscButtons";
import theme from "../lib/theme";

function App(): React.ReactElement {
	return (
		<div>
			<Title>Config UI!</Title>
			<MiscButtons />
		</div>
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
