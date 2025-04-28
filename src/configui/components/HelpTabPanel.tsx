import React from "react";
import { Text, Title, Anchor, Code, Group } from "@mantine/core";

export default function HelpTabPanel() {
	return (
		<>
			<Title order={2}>Help</Title>
			<Text size="md">
				Custom Bang Search adds DuckDuckGo-style bangs to your address bar.
			</Text>

			<Title order={2}>Supported Engines</Title>
			<Text size="md">
				<Anchor
					href="https://github.com/psidex/CustomBangSearch/blob/master/docs/supported-engines.md"
					target="_blank"
				>
					View tested engines
				</Anchor>
			</Text>

			<Title order={2}>Usage</Title>
			<Text size="md">
				Open options from the extension menu to create bangs. Use{" "}
				<Code>%s</Code> as your query placeholder.
			</Text>

			<Title order={2}>Icon</Title>
			<Group>
				<Text size="md">Made by apien on Flaticon.</Text>
				<Anchor
					href="https://www.flaticon.com/free-icon/exclamation-mark_4194667"
					target="_blank"
				>
					Source
				</Anchor>
			</Group>
		</>
	);
}
