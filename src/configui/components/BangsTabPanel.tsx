import React, {
	useState,
	useEffect,
	useCallback,
	type Dispatch,
	type SetStateAction,
} from "react";
import { Button, Stack, Group, Alert } from "@mantine/core";
import {
	ArrowDownAZ,
	ArrowUpAZ,
	Check,
	Download,
	Replace,
	RotateCcw,
	Save,
	SquarePlus,
	TriangleAlert,
	X,
} from "lucide-react";
import { useLocalStorage } from "@uidotdev/usehooks";
import { Virtuoso } from "react-virtuoso";

import * as config from "../../lib/config/config";
import * as storage from "../../lib/config/storage/storage";
import { setBangInfoLookup } from "../../background/lookup";
import defaultConfig from "../../lib/config/default";
import { notifications } from "@mantine/notifications";

import BangConfigurator from "./BangConfigurator";
import BangFileUploader from "./BangsImporter";

const createNewBang = (): config.BangInfo => ({
	id: crypto.randomUUID(),
	keyword: "",
	alias: null,
	defaultUrl: "",
	urls: [
		{
			id: crypto.randomUUID(),
			url: "",
		},
	],
	dontEncodeQuery: false,
});

const createNewAlias = (): config.BangInfo => ({
	id: crypto.randomUUID(),
	keyword: "",
	alias: "",
	defaultUrl: "",
	urls: [],
	dontEncodeQuery: false,
});

type sortOrders = "asc" | "desc";

const sortBangInfos = (
	toSort: Array<config.BangInfo>,
	sortOrder: sortOrders,
) => {
	return [...toSort].sort((a, b) => {
		// Empty bangs are equal
		if (a.keyword === "" && b.keyword === "") {
			return 0;
		}

		// Empty bangs should always remain at the top
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

function findDuplicateBangs(
	bangs: config.BangInfo[],
	ignoreCase: boolean,
): Set<string> {
	const seen = new Set<string>();
	const dupes = new Set<string>();
	for (const bang of bangs) {
		const keyword = ignoreCase ? bang.keyword.toLowerCase() : bang.keyword;
		if (seen.has(keyword)) {
			dupes.add(keyword);
		}
		seen.add(keyword);
	}
	return dupes;
}

interface Props {
	initialBangs: config.BangInfo[];
	setInitialConfig: Dispatch<SetStateAction<config.Config>>;
	ignoreBangCase: boolean;
}

export default function BangsTabPanel(props: Props) {
	const { initialBangs, setInitialConfig, ignoreBangCase } = props;

	const [warning, setWarning] = useState<string | null>(null);
	const [keywordsWithDuplicates, setKeywordsWithDuplicates] = useState<
		Set<string>
	>(new Set());

	const [needToSave, setNeedToSave] = useState(false);
	const [sortOrder, setSortOrder] = useLocalStorage<sortOrders>(
		"sortOrder",
		"asc",
	);
	const [bangInfos, setBangInfos] = useState<config.BangInfo[]>(initialBangs);
	const setBangInfosWithSort = (newBangs: Array<config.BangInfo>) => {
		setBangInfos(sortBangInfos(newBangs, sortOrder));
	};

	useEffect(() => {
		// NOTE: Because the default bang info IDs are generated new when the code
		// is run, clicking "reset to default" can cause the save button to
		// highlight even if no information visible to the user has changed

		// We sort here so that the order in either doesn't matter
		const sortedBangInfos = sortBangInfos(bangInfos, "asc");
		const sortedInitialBangs = sortBangInfos(initialBangs, "asc");
		setNeedToSave(
			JSON.stringify(sortedBangInfos) !== JSON.stringify(sortedInitialBangs),
		);

		const dupes = findDuplicateBangs(bangInfos, ignoreBangCase);
		if (dupes.size !== 0) {
			setWarning(
				"You have bangs with duplicate keywords which may lead to unintended behaviour - use an alias instead",
			);
			setKeywordsWithDuplicates(dupes);
		} else {
			setWarning(null);
			setKeywordsWithDuplicates(new Set());
		}
	}, [bangInfos, initialBangs, ignoreBangCase]);

	// Use initialBangs in the dependency array, instead of bangInfos, so that we
	// only do this auto-sort when the user saves (or on load). bangInfo changes
	// on user input, initialBangs changes when user presses save button
	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		setBangInfosWithSort(bangInfos);
	}, [initialBangs, sortOrder]);

	const handleToggleSortOrder = () => {
		setSortOrder(sortOrder === "asc" ? "desc" : "asc");
	};

	const bangInfoChanged = (index: number, updatedBang: config.BangInfo) => {
		setBangInfos((prev) => {
			// Copy required to get React to notice array has changed
			const copy = [...prev];
			copy[index] = updatedBang;
			return copy;
		});
	};

	const addBang = () => {
		// Adds to start (top) of list
		setBangInfos((prev) => [createNewBang(), ...prev]);
	};

	const addAlias = () => {
		setBangInfos((prev) => [createNewAlias(), ...prev]);
	};

	const removeBang = (id: string) => {
		setBangInfos((prev) => prev.filter((bang) => bang.id !== id));
	};

	const saveBangs = async () => {
		const notifId = notifications.show({
			title: "Saving bangs...",
			message: "",
			loading: true,
			autoClose: false,
			withCloseButton: false,
		});

		// This is stupid but we need to let the notifications' style calculate
		// before we block with the (potentially) long running code below
		await new Promise((r) => setTimeout(r, 50));

		let cfg: config.Config;
		try {
			cfg = await storage.getConfig();
			const rollback = structuredClone(cfg);
			cfg.bangs = bangInfos;

			// The config in rollback will get re-stored before this call throws an
			// error, if it needs to throw one
			await storage.storeConfigWithRollback(cfg, rollback);

			setNeedToSave(false);
			setInitialConfig(cfg);

			// Don't forget about the LUT!
			await setBangInfoLookup(bangInfos);
		} catch (error) {
			notifications.update({
				id: notifId,
				title: "Failed to save bangs",
				message: error instanceof Error ? error.message : "",
				autoClose: true,
				icon: <X />,
				color: "red",
				loading: false,
			});
			return;
		}

		notifications.update({
			id: notifId,
			title: "Bangs saved",
			message: "",
			autoClose: true,
			icon: <Check />,
			color: "green",
			loading: false,
		});
	};

	const resetToDefault = () => {
		setBangInfosWithSort(defaultConfig().bangs);
	};

	const exportBangs = () => {
		const exported: config.BangsExport = {
			version: config.currentConfigVersion,
			bangs: config.bangInfosToExport(bangInfos),
		};
		const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exported))}`;
		// React probably doesn't like this 😬
		const a = document.createElement("a");
		a.setAttribute("href", dataStr);
		a.setAttribute("download", "custombangs.json");
		a.click(); // Blocks until user performs action.
		a.remove();
	};

	// Don't depend on the functions because they change every render
	// biome-ignore lint/correctness/useExhaustiveDependencies:
	const virtuosoRenderBang = useCallback(
		(index: number) => {
			const bang = bangInfos[index];
			return (
				<BangConfigurator
					bang={bang}
					index={index}
					onChange={bangInfoChanged}
					onRemove={() => removeBang(bang.id)}
					showWarning={keywordsWithDuplicates.has(
						ignoreBangCase ? bang.keyword.toLowerCase() : bang.keyword,
					)}
					lastInList={index === bangInfos.length - 1}
				/>
			);
		},
		[bangInfos, keywordsWithDuplicates, ignoreBangCase],
	);

	return (
		<Stack style={{ width: "100%" }}>
			<Group style={{ margin: "1em 1em 0 1em" }}>
				<Button
					onClick={saveBangs}
					size="md"
					variant={needToSave ? "filled" : "default"}
					color={needToSave ? "green" : ""}
					title="Save changes"
				>
					<Save style={{ marginRight: "0.5em" }} /> Save
				</Button>
				<Button
					onClick={addBang}
					size="md"
					variant="default"
					title="Add a new bang to the list"
				>
					<SquarePlus style={{ marginRight: "0.5em" }} /> Add Bang
				</Button>
				<Button
					onClick={addAlias}
					size="md"
					variant="default"
					title="Add a new bang alias to the list"
				>
					<Replace style={{ marginRight: "0.5em" }} /> Add Alias
				</Button>
				<BangFileUploader
					bangInfos={bangInfos}
					setBangInfos={setBangInfosWithSort}
				/>
				<Button
					onClick={exportBangs}
					size="md"
					variant="default"
					title="Export to a JSON file"
				>
					<Download style={{ marginRight: "0.5em" }} /> Export
				</Button>
				<Button
					onClick={resetToDefault}
					size="md"
					variant="default"
					title="Reset your bangs to the default values"
				>
					<RotateCcw style={{ marginRight: "0.5em" }} /> Reset to Default
				</Button>
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
				{warning !== null && (
					<Alert variant="light" color="orange" icon={<TriangleAlert />}>
						{warning}
					</Alert>
				)}
			</Group>
			{/* Render the list of bang configurators using Virtuoso, so only the ones on screen are actually rendered */}
			<Virtuoso
				style={{ height: "100%", width: "100%", margin: "0 1em" }}
				data={bangInfos}
				itemContent={(index) => virtuosoRenderBang(index)}
				overscan={50} // Render this many more items than are visible
				increaseViewportBy={200} // Expands render "window" beyond visible by this many pixels
				initialItemCount={0} // Set to 0 so it doesn't try to render non existent items
				defaultItemHeight={undefined} // Let it work this out
			/>
		</Stack>
	);
}
