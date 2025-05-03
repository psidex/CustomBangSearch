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
import type { BangInfo } from "../../lib/config/config";

import BangConfigurator from "./BangConfigurator";

export default function HelpTabPanel() {
	return (
		<Stack style={{ margin: "2em 0", width: "70em" }} gap="lg">
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
			</Stack>

			<Stack>
				<Title order={2}>Configuration</Title>
				<Text>
					On the bang configuration page, you can configure each individual
					bang:
				</Text>
				<BangConfigurator
					bang={
						defaultConfig().bangs.find((b) => b.keyword === "a") as BangInfo
					}
					index={0}
					onChange={() => {}}
					onRemove={() => {}}
					showWarning={false}
					lastInList={false}
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
							take you to if you dont provide a query. If this is left blank, an
							empty query will take you to the origin of the URL(s) in the list
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
					bang={
						defaultConfig().bangs.find((b) => b.keyword === "az") as BangInfo
					}
					index={0}
					onChange={() => {}}
					onRemove={() => {}}
					showWarning={false}
					lastInList={false}
				/>
				<Text>
					The first input (left) is the keyword, and the second (right) is the
					bang to copy
				</Text>
			</Stack>

			<Stack>
				<Title order={2}>DuckDuckGo Bangs</Title>
				<Text>
					There are some JSON files{" "}
					<Anchor
						href="https://github.com/psidex/CustomBangSearch/blob/master/ddg/README.md"
						target="_blank"
					>
						here
					</Anchor>{" "}
					that contain the most popular DuckDuckGo bangs, if you want to import
					them
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
				<Text>
					If you set one of these as your browsers search engine, you can use
					the bangs directly in the search bar.
				</Text>
				<Text>
					Bangs will also work by just using the search engines normally.
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
