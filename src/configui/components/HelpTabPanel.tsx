import {
	Anchor,
	Code,
	Group,
	List,
	ListItem,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import React from "react";
import type { QuickSearch } from "../../lib/config/config";
import defaultConfig from "../../lib/config/default";

import QuickSearchConfigurator from "./QuickSearchConfigurator";

// Shows the default quick search with this keyword, which does nothing if edited
function Example({ keyword }: { keyword: string }) {
	return (
		<QuickSearchConfigurator
			quickSearch={
				defaultConfig().quickSearches.find(
					(q) => q.keyword === keyword,
				) as QuickSearch
			}
			index={0}
			onChange={() => {}}
			onRemove={() => {}}
			showWarning={false}
			lastInList={false}
			// Show every setting so they can all be explained
			advancedMode={true}
		/>
	);
}

export default function HelpTabPanel() {
	return (
		<Stack style={{ margin: "2em 0", width: "70em" }} gap="lg">
			<Stack>
				<Title order={2}>What does this do?</Title>
				<Text size="md">
					Custom Quick Search adds fully customisable quick searches to your
					address bar, similar to{" "}
					<Anchor href="https://duckduckgo.com/bangs" target="_blank">
						DuckDuckGo bangs
					</Anchor>
					. Quick searches quickly take you to search results on other sites.
				</Text>
				<Text>
					To use a quick search, type in your browser's search bar and use your
					chosen trigger and keyword to search a site.
				</Text>
				<Text>
					The structure for using a quick search is:{" "}
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
					On the quick search configuration page, you can configure each
					individual quick search:
				</Text>
				<Example keyword="a" />
				<Text>
					In this extension, <i>quick search</i> refers to the entire row.
				</Text>
				<Text>From left to right, the configuration row allows you to:</Text>
				<List>
					<ListItem>
						<Text>Delete a quick search</Text>
					</ListItem>
					<ListItem>
						<Text>Edit the quick search's keyword</Text>
					</ListItem>
					<ListItem>
						<Text>
							Edit the quick search's default URL. This is the location the
							quick search will take you to if you don't provide a query. If
							this is left blank, an empty query will take you to the origin of
							the URL(s) in the list
						</Text>
					</ListItem>
					<ListItem>
						<Text>
							Edit the list of URLs that the quick search redirects to. This can
							be a single URL or a list, which will open multiple tabs. Each URL
							should contain <Code>%s</Code>, this will be replaced by your
							search query when the quick search is used
						</Text>
					</ListItem>
					<ListItem>
						<Text>Add to / delete from the list of URLs</Text>
					</ListItem>
					<ListItem>
						<Text>
							Turn "Don't encode query" on / off. This decides if Custom Quick
							Search runs{" "}
							<Anchor
								href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent"
								target="_blank"
							>
								<Code>encodeURIComponent</Code>
							</Anchor>{" "}
							on your query before it creates the redirect URL. If you don't
							know what this means, you probably want to leave this switch off,
							so that your query is encoded. This switch is only shown when
							"Advanced mode" is turned on, next to the sort order button
						</Text>
					</ListItem>
				</List>
				<Text>
					Aliases are also supported, these are used to assign a keyword to
					behave exactly the same as an already existing quick search:
				</Text>
				<Example keyword="az" />
				<Text>
					The first input (left) is the keyword, and the second (right) is the
					keyword of the quick search to copy
				</Text>
			</Stack>

			<Stack>
				<Title order={2}>Supported Search Engines</Title>
				<Text>
					In order for this extension to work, it has to intercept requests made
					to your search engine, and check if you are trying to use a quick
					search. For this to work, the extension has to have permissions for
					that host, and has to have code to support it.
				</Text>
				<Text size="md">
					You can see the supported search engines{" "}
					<Anchor
						href="https://github.com/psidex/CustomQuickSearch/blob/master/docs/supported-engines.md"
						target="_blank"
					>
						here
					</Anchor>
					.
				</Text>
				<Text>
					If you set one of these as your browser's search engine, you can use
					your quick searches directly in the search bar.
				</Text>
				<Text>
					Quick searches will also work by just using the search engines
					normally.
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
