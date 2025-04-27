import React from "react";
import { Stack, Button } from "@mantine/core";

export default function BangsTabPanel() {
	const saveOptions = async () => {};

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
		</Stack>
	);
}
