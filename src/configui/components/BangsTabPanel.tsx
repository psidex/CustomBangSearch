import React, {
	useState,
	useEffect,
	type Dispatch,
	type SetStateAction,
} from "react";
import { Button, Stack, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
	ArrowDownCircle,
	ArrowUpCircle,
	Check,
	Download,
	FolderUp,
	RotateCcw,
	Save,
	SquarePlus,
} from "lucide-react";
import { useLocalStorage } from "@uidotdev/usehooks";

import BangConfigurator from "./BangConfigurator";
import type * as config from "../../lib/config/config";
import * as storage from "../../lib/config/storage/storage";
import { setBangInfoLookup } from "../../background/lookup";

const createNewBang = (): config.BangInfo => ({
	id: crypto.randomUUID(),
	keyword: "",
	alias: "",
	defaultUrl: "",
	urls: [],
	dontEncodeQuery: false,
});

interface Props {
	initialBangs: config.BangInfo[];
	setInitialConfig: Dispatch<SetStateAction<config.Config>>;
}

export default function BangsTabPanel(props: Props) {
	const { initialBangs, setInitialConfig } = props;

	const [needToSave, setNeedToSave] = useState(false);
	const [bangInfos, setBangInfos] = useState<config.BangInfo[]>(initialBangs);
	const [sortOrder, setSortOrder] = useLocalStorage<"asc" | "desc">(
		"sortOrder",
		"asc",
	);

	useEffect(() => {
		// Sort here so the order in either doesn't matter
		const sortedBangInfos = [...bangInfos].sort((a, b) =>
			a.keyword.localeCompare(b.keyword),
		);
		const sortedInitialBangs = [...initialBangs].sort((a, b) =>
			a.keyword.localeCompare(b.keyword),
		);
		setNeedToSave(
			JSON.stringify(sortedBangInfos) !== JSON.stringify(sortedInitialBangs),
		);
	}, [bangInfos, initialBangs]);

	// Use initialBangs in place of bangInfos so we only auto-sort when user saves
	// (or on load)
	// biome-ignore lint/correctness/useExhaustiveDependencies: ↑
	useEffect(() => {
		const sortedBangs = [...bangInfos].sort((a, b) => {
			if (a.keyword === "" && b.keyword === "") return 0;
			if (a.keyword === "") return sortOrder === "asc" ? -1 : 1;
			if (b.keyword === "") return sortOrder === "asc" ? 1 : -1;
			return sortOrder === "asc"
				? a.keyword.localeCompare(b.keyword)
				: b.keyword.localeCompare(a.keyword);
		});
		setBangInfos(sortedBangs);
	}, [initialBangs, sortOrder]);

	const handleToggleSortOrder = () => {
		const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
		setSortOrder(newSortOrder);
	};

	const handleBangInfoChanged = (
		index: number,
		updatedBang: config.BangInfo,
	) => {
		// NOTE: This should reduce re-rendering because everything is the same
		// except the given index
		setBangInfos((prev) => {
			const copy = [...prev];
			copy[index] = updatedBang;
			return copy;
		});
	};

	const handleAddBang = () => {
		setBangInfos((prev) => [...prev, createNewBang()]);
	};

	const handleRemoveBang = (id: string) => {
		setBangInfos((prev) => prev.filter((bang) => bang.id !== id));
	};

	const saveBangs = async () => {
		// TODO: Catch errs, display err notif
		const cfg = await storage.getConfig();
		cfg.bangs = bangInfos;
		await storage.storeConfig(cfg);

		setNeedToSave(false);
		setInitialConfig(cfg);

		// Don't forget about the LUT!
		setBangInfoLookup(bangInfos);

		notifications.show({
			title: "Settings saved",
			message: "",
			autoClose: true,
			icon: <Check />,
			color: "green",
		});
	};

	return (
		<Stack>
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
					onClick={handleAddBang}
					size="md"
					variant="default"
					title="Add a new bang to the list"
				>
					<SquarePlus style={{ marginRight: "0.5em" }} /> Add Bang
				</Button>
				<Button
					onClick={() => {}}
					size="md"
					variant="default"
					title="Import from an exported JSON file"
				>
					<FolderUp style={{ marginRight: "0.5em" }} /> Import
				</Button>
				<Button
					onClick={() => {}}
					size="md"
					variant="default"
					title="Export to a JSON file"
				>
					<Download style={{ marginRight: "0.5em" }} /> Export
				</Button>
				<Button
					onClick={() => {}}
					size="md"
					variant="default"
					title="Reset your bangs to the default values"
				>
					<RotateCcw style={{ marginRight: "0.5em" }} /> Reset to Default
				</Button>
			</Group>
			<Group style={{ margin: "0 1em 0 1em" }}>
				<Button
					onClick={handleToggleSortOrder}
					size="md"
					variant="default"
					title="Toggle Sort Order"
				>
					{sortOrder === "asc" ? (
						<>
							<ArrowDownCircle style={{ marginRight: "0.5em" }} /> Sort
							Descending
						</>
					) : (
						<>
							<ArrowUpCircle style={{ marginRight: "0.5em" }} /> Sort Ascending
						</>
					)}{" "}
				</Button>
			</Group>
			{bangInfos.map((bang, i) => (
				<BangConfigurator
					key={bang.id}
					bang={bang}
					index={i}
					onChange={handleBangInfoChanged}
					onRemove={() => handleRemoveBang(bang.id)}
				/>
			))}
		</Stack>
	);
}
