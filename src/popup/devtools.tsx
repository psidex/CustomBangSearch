import React from "react";
import { Box, Button, Text } from "@mantine/core";

import * as storage from "../lib/config/storage/storage";
import defaultConfig from "../lib/config/default";

export default function DevTools() {
	return (
		<Box
			style={{
				borderColor: "red",
				borderWidth: "3px",
				borderStyle: "solid",
				padding: "10px",
			}}
		>
			<Text style={{ color: "red" }}>Dev Tools</Text>
			<Button
				onClick={async () => {
					await storage.storeConfig(defaultConfig);
				}}
			>
				Reset Config
			</Button>
		</Box>
	);
}
