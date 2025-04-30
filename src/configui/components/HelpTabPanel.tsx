import React from "react";
import {
	Stack,
	Text,
	Title,
	Anchor,
	Code,
	Group,
	List,
	ListItem,
} from "@mantine/core";

import defaultConfig from "../../lib/config/default";

import BangConfigurator from "./BangConfigurator";

export default function HelpTabPanel() {
	return (
		<Stack style={{ marginTop: "2em" }} gap="lg">
			<Stack>
				<Title order={2}>What does this do?</Title>
				<Text size="md">
					Custom Bang Search adds fully customisable{" "}
					<Anchor href="https://duckduckgo.com/bangs" target="_blank">
						DuckDuckGo-style bangs
					</Anchor>{" "}
					to your address bar. Bangs are shortcuts that quickly take you to
					search results on other sites.
				</Text>
				<Text>
					To use a bang, type in your browsers search bar and use your chosen
					trigger and keyword to search a site.
				</Text>
				<Text>
					The structure for using a bang is:{" "}
					<Code>&lt;trigger&gt;&lt;keyword&gt; &lt;query&gt;</Code>; the trigger
					is traditionally <Code>!</Code>, the keyword defines the site to
					search, and the query is your search query! For example:{" "}
					<Code>!y jaws</Code> might be setup to search YouTube, which would
					take you to{" "}
					<Code>https://www.youtube.com/results?search_query=jaws</Code>
				</Text>
				<Text>
					On the bang configuration page, you can configure each individual
					bang:
				</Text>
				<BangConfigurator
					bang={defaultConfig().bangs[0]}
					index={0}
					onChange={() => {}}
					onRemove={() => {}}
					showWarning={false}
				/>
				<Text>
					In this extension, <i>bang</i> refers to the entire row.
				</Text>
				<Text>From left to right, the configuration row allows you to:</Text>
				<List>
					<ListItem>
						<Text>Delete a bang</Text>
					</ListItem>
					<ListItem>
						<Text>Edit the bangs keyword</Text>
					</ListItem>
					<ListItem>
						<Text>
							Edit the bangs default URL. This is the location the bang will
							take you to if you dont provide a query
						</Text>
					</ListItem>
					<ListItem>
						<Text>
							Edit the list of URLs that the bang redirects to. This can be a
							single URL or a list, which will open multiple tabs. Each URL
							should contain <Code>%s</Code>, this will be replaced by your
							search query when the bang is used
						</Text>
					</ListItem>
					<ListItem>
						<Text>Add to / delete from the list of URLs</Text>
					</ListItem>
					<ListItem>
						<Text>
							Turn query encoding off / on. This decides if Custom Bang Search
							runs{" "}
							<Anchor
								href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent"
								target="_blank"
							>
								<Code>encodeURIComponent</Code>
							</Anchor>{" "}
							on your query before it creates the redirect URL. If you don't
							know what this means, you probably want to leave it off
						</Text>
					</ListItem>
				</List>
				<Text>
					Aliases are also supported, these are used to assign a keyword to
					behave exactly the same as an already existing bang:
				</Text>
				<BangConfigurator
					bang={defaultConfig().bangs[1]}
					index={0}
					onChange={() => {}}
					onRemove={() => {}}
					showWarning={false}
				/>
				<Text>
					The first input (left) is the keyword, and the second (right) is the
					bang to copy
				</Text>
			</Stack>

			<Stack>
				<Title order={2}>Supported Search Engines</Title>
				<Text>
					In order for this extension to work, it has to intercept requests made
					to your search engine, and check if you are trying to use a bang. For
					this to work, the extension has to have permissions for that host, and
					has to have code to support it.
				</Text>
				<Text size="md">
					You can see the supported search engines{" "}
					<Anchor
						href="https://github.com/psidex/CustomBangSearch/blob/master/docs/supported-engines.md"
						target="_blank"
					>
						here
					</Anchor>
					.
				</Text>
			</Stack>

			<Stack>
				<Title order={2}>Icon Credit</Title>
				<Group>
					<Text size="md">
						Made by{" "}
						<Anchor
							href="https://www.flaticon.com/free-icon/exclamation-mark_4194667"
							target="_blank"
						>
							apien on Flaticon
						</Anchor>
					</Text>
				</Group>
			</Stack>
		</Stack>
	);
}
