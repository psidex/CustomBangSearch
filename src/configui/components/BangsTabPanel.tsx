import React, {
	useRef,
	useState,
	useEffect,
	type Dispatch,
	type ChangeEvent,
	type SetStateAction,
} from "react";
import { Button, Stack, Group, Divider } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
	ArrowDownAZ,
	ArrowUpAZ,
	Check,
	Download,
	FolderUp,
	Replace,
	RotateCcw,
	Save,
	SquarePlus,
	X,
} from "lucide-react";
import { useLocalStorage } from "@uidotdev/usehooks";

import BangConfigurator from "./BangConfigurator";
import * as config from "../../lib/config/config";
import * as storage from "../../lib/config/storage/storage";
import { setBangInfoLookup } from "../../background/lookup";
import defaultConfig from "../../lib/config/default";
import * as legacy from "../../lib/config/legacy";
import { errorNotif, successNotif } from "../../lib/components/notifications";

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
	bangInfos: Array<config.BangInfo>,
	sortOrder: sortOrders,
) => {
	return [...bangInfos].sort((a, b) => {
		if (a.keyword === "" && b.keyword === "") return 0;
		if (a.keyword === "") return sortOrder === "asc" ? -1 : 1;
		if (b.keyword === "") return sortOrder === "asc" ? 1 : -1;
		return sortOrder === "asc"
			? a.keyword.localeCompare(b.keyword)
			: b.keyword.localeCompare(a.keyword);
	});
};

interface Props {
	initialBangs: config.BangInfo[];
	setInitialConfig: Dispatch<SetStateAction<config.Config>>;
}

export default function BangsTabPanel(props: Props) {
	const { initialBangs, setInitialConfig } = props;

	const fileInputRef = useRef<HTMLInputElement>(null);

	const [needToSave, setNeedToSave] = useState(false);
	const [bangInfos, setBangInfos] = useState<config.BangInfo[]>(initialBangs);
	const [sortOrder, setSortOrder] = useLocalStorage<sortOrders>(
		"sortOrder",
		"asc",
	);

	useEffect(() => {
		// Sort here so the order in either doesn't matter
		const sortedBangInfos = sortBangInfos(bangInfos, "asc");
		const sortedInitialBangs = sortBangInfos(initialBangs, "asc");
		setNeedToSave(
			JSON.stringify(sortedBangInfos) !== JSON.stringify(sortedInitialBangs),
		);
		// TODO: Maybe here, warn user if bangInfos has duplicate keywords (and if
		// ignore case is turned on, take that into account)
	}, [bangInfos, initialBangs]);

	// Use initialBangs in place of bangInfos so we only auto-sort when user saves
	// (or on load)
	// biome-ignore lint/correctness/useExhaustiveDependencies: ↑
	useEffect(() => {
		setBangInfos(sortBangInfos(bangInfos, sortOrder));
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
		// Adds to start (top) of list
		setBangInfos((prev) => [createNewBang(), ...prev]);
	};

	const handleAddAlias = () => {
		setBangInfos((prev) => [createNewAlias(), ...prev]);
	};

	const handleRemoveBang = (id: string) => {
		setBangInfos((prev) => prev.filter((bang) => bang.id !== id));
	};

	const saveBangs = async () => {
		let cfg: config.Config;
		try {
			cfg = await storage.getConfig();
			cfg.bangs = bangInfos;
			await storage.storeConfig(cfg);

			setNeedToSave(false);
			setInitialConfig(cfg);

			// Don't forget about the LUT!
			await setBangInfoLookup(bangInfos);
		} catch (error) {
			errorNotif(
				"Failed to save bangs",
				error instanceof Error ? error.message : "",
			);
			return;
		}

		successNotif("Settings saved", "");
	};

	const resetToDefault = () => {
		// TODO(future): Slightly weird behaviour with save btn highlighting because
		// of the random IDs I think, should investigate just in case
		setBangInfos(sortBangInfos(defaultConfig.bangs, sortOrder));
	};

	const importBangs = () => {
		if (fileInputRef.current !== null) {
			fileInputRef.current.click();
		}
	};

	const fileUpload = async (
		e: ChangeEvent<HTMLInputElement>,
	): Promise<void> => {
		if (e.target.files === null) {
			return;
		}

		const file: File = e.target.files[0];

		if (fileInputRef.current !== null) {
			// Reset the selected file so that if the user imports the same file again,
			// the change event will still fire.
			fileInputRef.current.value = "";
		}

		// biome-ignore lint/suspicious/noExplicitAny: User controlled input
		let uploaded: any = {};
		try {
			uploaded = JSON.parse(await file.text());
		} catch (_error) {
			errorNotif(
				"Failed to import bangs",
				`Could not parse ${file.name} as valid JSON`,
			);
			return;
		}

		// TODO(future): Better checking before asserting type
		if (typeof uploaded.version !== "number" || uploaded.bangs === undefined) {
			errorNotif(
				"Failed to import bangs",
				`Could not parse ${file.name} as valid config`,
			);
			return;
		}

		// Force type hinting to improve linting for fns called
		// TODO(future): Type guards for types used here and elsewhere
		const uploadedObj = uploaded as unknown;

		let newBangInfos: config.BangInfo[] = [];

		switch ((uploadedObj as { version: number }).version) {
			case 5:
				newBangInfos = [
					...bangInfos,
					...legacy.convertSettingsToConfig(uploadedObj as legacy.Settings)
						.bangs,
				];
				break;
			case 6:
				newBangInfos = [
					...bangInfos,
					...config.bangInfosFromExport(
						(uploadedObj as config.BangsExport).bangs,
					),
				];
				break;
			default:
				errorNotif(
					"Failed to import bangs",
					`File ${file.name} is not from a supported version (5, 6)`,
				);
				return;
		}

		setBangInfos(newBangInfos);
		successNotif("Successfully imported bangs", `${file.name}`);
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
					onClick={handleAddAlias}
					size="md"
					variant="default"
					title="Add a new bang alias to the list"
				>
					<Replace style={{ marginRight: "0.5em" }} /> Add Alias
				</Button>
				<Button
					onClick={importBangs}
					size="md"
					variant="default"
					title="Import from an exported JSON file"
				>
					<FolderUp style={{ marginRight: "0.5em" }} /> Import
				</Button>
				<Button
					onClick={exportBangs}
					size="md"
					variant="default"
					title="Export to a JSON file"
				>
					<Download style={{ marginRight: "0.5em" }} /> Export
				</Button>
				<input
					ref={fileInputRef}
					type="file"
					accept="application/json"
					style={{ display: "none" }}
					onChange={fileUpload}
				/>
				<Button
					onClick={resetToDefault}
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
					title="Toggle sort order"
				>
					{sortOrder === "asc" ? (
						<>
							<ArrowDownAZ style={{ marginRight: "0.5em" }} />
						</>
					) : (
						<>
							<ArrowUpAZ style={{ marginRight: "0.5em" }} />
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
