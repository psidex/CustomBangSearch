import React from "react";
import {
	Stack,
	Title,
	Text,
	Group,
	Switch,
	Input,
	Radio,
	SegmentedControl,
	Code,
	Anchor,
} from "@mantine/core";

export default function BangsTabPanel() {
	return (
		<Stack>
			<Group>
				<Stack>
					<Title order={3}>Trigger</Title>
					<Text>
						The character(s) to trigger the extension, traditionally{" "}
						<Code>!</Code>
					</Text>
				</Stack>
				<Input />
			</Group>
			<Group>
				<Stack>
					<Title order={3}>Storage Method</Title>
					<Text w={350}>
						The storage method for config, <Code>sync</Code> uses your browsers{" "}
						<Anchor
							href="https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/sync"
							target="_blank"
						>
							sync storage
						</Anchor>
						, <Code>local</Code> uses{" "}
						<Anchor
							href="https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/local"
							target="_blank"
						>
							local storage
						</Anchor>
					</Text>
				</Stack>
				<SegmentedControl data={["sync", "local"]} />
			</Group>
			<Group>
				<Stack>
					<Title order={3}>Enabled Domains</Title>
					<Text>Search engine domains that this extension will trigger on</Text>
					<Switch label="a.com" />
					<Switch label="b.com" />
					<Switch label="c.com" />
				</Stack>
			</Group>
			<Group>
				<Stack>
					<Title order={3}>Case Insensitive Bangs</Title>
					<Text>
						For example, if active, <Code>!a</Code> and <Code>!A</Code> will be
						equivalent
					</Text>
				</Stack>
				<Switch />
			</Group>
			<Group>
				<Stack>
					{/* TODO: This would probably be better suited in the bangs page as a button */}
					<Title order={3}>Sort Bangs Alphabetically</Title>
					<Text>Sort bang list alphabetically in configuration UI</Text>
				</Stack>
				<Switch />
			</Group>
			<Group>
				<Stack>
					<Title order={3}>Query Separator</Title>
					<Text>
						If non-empty, this is used to split queries into multiple searches
						on every URL
					</Text>
					<Text>CURRENTLY DOES NOTHING</Text>
				</Stack>
				<Input />
			</Group>
		</Stack>
	);
}
