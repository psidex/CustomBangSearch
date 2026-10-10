import { Alert, Button, Group, Stack, Switch } from "@mantine/core";
import { useLocalStorage } from "@uidotdev/usehooks";
import {
	ArrowDownAZ,
	ArrowUpAZ,
	Download,
	Replace,
	RotateCcw,
	Save,
	SquarePlus,
	TriangleAlert,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import * as config from "../../lib/config/config";
import defaultConfig from "../../lib/config/default";
import * as storage from "../../lib/config/storage/storage";
import { saveWithNotif } from "../notifications";

import QuickSearchConfigurator from "./QuickSearchConfigurator";
import QuickSearchImporter from "./QuickSearchImporter";
import ToolbarButton from "./ToolbarButton";

type sortOrders = "asc" | "desc";

const sortQuickSearches = (
	toSort: Array<config.QuickSearch>,
	sortOrder: sortOrders,
) => {
	return [...toSort].sort((a, b) => {
		// Empty keywords are equal
		if (a.keyword === "" && b.keyword === "") {
			return 0;
		}

		// Empty keywords should always remain at the top
		if (a.keyword === "") {
			return -1;
		}
		if (b.keyword === "") {
			return 1;
		}

		// Otherwise compare
		return sortOrder === "asc"
			? a.keyword.localeCompare(b.keyword)
			: b.keyword.localeCompare(a.keyword);
	});
};

function findDuplicateKeywords(
	quickSearches: config.QuickSearch[],
	ignoreCase: boolean,
): Set<string> {
	const seen = new Set<string>();
	const dupes = new Set<string>();
	for (const quickSearch of quickSearches) {
		const keyword = ignoreCase
			? quickSearch.keyword.toLowerCase()
			: quickSearch.keyword;
		if (seen.has(keyword)) {
			dupes.add(keyword);
		}
		seen.add(keyword);
	}
	return dupes;
}

interface Props {
	initialQuickSearches: config.QuickSearch[];
	setInitialConfig: (cfg: config.Config) => void;
	ignoreKeywordCase: boolean;
	advancedMode: boolean;
	setAdvancedMode: (advancedMode: boolean) => void;
}

export default function QuickSearchesTabPanel(props: Props) {
	const {
		initialQuickSearches,
		setInitialConfig,
		ignoreKeywordCase,
		advancedMode,
		setAdvancedMode,
	} = props;

	const [sortOrder, setSortOrder] = useLocalStorage<sortOrders>(
		"sortOrder",
		"asc",
	);
	const [quickSearches, setQuickSearches] =
		useState<config.QuickSearch[]>(initialQuickSearches);
	const setQuickSearchesWithSort = (
		newQuickSearches: Array<config.QuickSearch>,
	) => {
		setQuickSearches(sortQuickSearches(newQuickSearches, sortOrder));
	};

	// NOTE: Because the default quick search IDs are generated new when the code
	// is run, clicking "reset to default" can cause the save button to highlight
	// even if no information visible to the user has changed
	const needToSave = useMemo(
		() =>
			// We sort here so that the order in either doesn't matter
			JSON.stringify(sortQuickSearches(quickSearches, "asc")) !==
			JSON.stringify(sortQuickSearches(initialQuickSearches, "asc")),
		[quickSearches, initialQuickSearches],
	);

	const keywordsWithDuplicates = useMemo(
		() => findDuplicateKeywords(quickSearches, ignoreKeywordCase),
		[quickSearches, ignoreKeywordCase],
	);

	// Use initialQuickSearches in the dependency array, instead of quickSearches, so that we
	// only do this auto-sort when the user saves (or on load). quickSearches changes
	// on user input, initialQuickSearches changes when user presses save button
	useEffect(() => {
		setQuickSearchesWithSort(quickSearches);
	}, [initialQuickSearches, sortOrder]);

	const handleToggleSortOrder = () => {
		setSortOrder(sortOrder === "asc" ? "desc" : "asc");
	};

	const quickSearchChanged = (
		index: number,
		updatedQuickSearch: config.QuickSearch,
	) => {
		setQuickSearches((prev) => {
			// Copy required to get React to notice array has changed
			const copy = [...prev];
			copy[index] = updatedQuickSearch;
			return copy;
		});
	};

	const addQuickSearch = () => {
		// Adds to start (top) of list
		setQuickSearches((prev) => [config.newQuickSearch("", "", [""]), ...prev]);
	};

	const addAlias = () => {
		setQuickSearches((prev) => [
			config.newQuickSearch("", "", [], ""),
			...prev,
		]);
	};

	const removeQuickSearch = (id: string) => {
		setQuickSearches((prev) =>
			prev.filter((quickSearch) => quickSearch.id !== id),
		);
	};

	const saveQuickSearches = () =>
		saveWithNotif("quick searches", async () => {
			const cfg = await storage.getConfig();
			const rollback = structuredClone(cfg);
			cfg.quickSearches = quickSearches;

			// The config in rollback will get re-stored before this call throws an
			// error, if it needs to throw one
			await storage.storeConfigWithRollback(cfg, rollback);

			setInitialConfig(cfg);
		});

	const resetToDefault = () => {
		setQuickSearchesWithSort(defaultConfig().quickSearches);
	};

	const exportQuickSearches = () => {
		const exported: config.QuickSearchesExport = {
			version: config.currentConfigVersion,
			quickSearches: config.quickSearchesToExport(quickSearches),
		};
		const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exported))}`;
		// React probably doesn't like this 😬
		const a = document.createElement("a");
		a.setAttribute("href", dataStr);
		a.setAttribute("download", "cqs-export.json");
		a.click();
	};

	return (
		<Stack style={{ width: "100%" }}>
			<Group style={{ margin: "1em 1em 0 1em" }}>
				<ToolbarButton
					icon={Save}
					label="Save"
					title="Save changes"
					onClick={saveQuickSearches}
					highlight={needToSave}
				/>
				<ToolbarButton
					icon={SquarePlus}
					label="Add Quick Search"
					title="Add a new quick search to the list"
					onClick={addQuickSearch}
				/>
				<ToolbarButton
					icon={Replace}
					label="Add Alias"
					title="Add a new alias to the list"
					onClick={addAlias}
				/>
				<QuickSearchImporter
					quickSearches={quickSearches}
					setQuickSearches={setQuickSearchesWithSort}
				/>
				<ToolbarButton
					icon={Download}
					label="Export"
					title="Export to a JSON file"
					onClick={exportQuickSearches}
				/>
				<ToolbarButton
					icon={RotateCcw}
					label="Reset to Default"
					title="Reset your quick searches to the default values"
					onClick={resetToDefault}
				/>
			</Group>
			<Group style={{ margin: "0 1em" }}>
				<Button
					onClick={handleToggleSortOrder}
					size="md"
					variant="default"
					title={`Showing in ${sortOrder === "asc" ? "ascending" : "descending"} order`}
				>
					Sort Order
					{sortOrder === "asc" ? (
						<ArrowDownAZ style={{ margin: "0 0.5em 0 0.5em" }} />
					) : (
						<ArrowUpAZ style={{ margin: "0 0.5em 0 0.5em" }} />
					)}{" "}
				</Button>
				<Switch
					label="Advanced mode"
					title="Show advanced settings, e.g. Don't encode query"
					checked={advancedMode}
					onChange={(e) => setAdvancedMode(e.currentTarget.checked)}
				/>
				{keywordsWithDuplicates.size !== 0 && (
					<Alert variant="light" color="orange" icon={<TriangleAlert />}>
						You have quick searches with duplicate keywords which may lead to
						unintended behaviour - use an alias instead
					</Alert>
				)}
			</Group>
			{/* Render the list of quick search configurators using Virtuoso, so only the ones on screen are actually rendered */}
			<Virtuoso
				style={{ height: "100%", width: "100%", margin: "0 1em" }}
				data={quickSearches}
				itemContent={(index, quickSearch) => (
					<QuickSearchConfigurator
						quickSearch={quickSearch}
						index={index}
						onChange={quickSearchChanged}
						onRemove={() => removeQuickSearch(quickSearch.id)}
						showWarning={keywordsWithDuplicates.has(
							ignoreKeywordCase
								? quickSearch.keyword.toLowerCase()
								: quickSearch.keyword,
						)}
						lastInList={index === quickSearches.length - 1}
						advancedMode={advancedMode}
					/>
				)}
				overscan={50} // Render this many more items than are visible
				increaseViewportBy={200} // Expands render "window" beyond visible by this many pixels
			/>
		</Stack>
	);
}
