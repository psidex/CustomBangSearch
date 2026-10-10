import { FileButton } from "@mantine/core";
import { FolderUp } from "lucide-react";
import React from "react";
import * as config from "../../lib/config/config";
import { migrateExport } from "../../lib/config/migrations";
import { errorNotif, successNotif } from "../notifications";
import ToolbarButton from "./ToolbarButton";

interface Props {
	quickSearches: config.QuickSearch[];
	setQuickSearches: (newQuickSearches: config.QuickSearch[]) => void;
}

export default function QuickSearchImporter(props: Props) {
	const { quickSearches, setQuickSearches } = props;

	const handleFileChange = async (file: File | null): Promise<void> => {
		if (!file) {
			return;
		}

		let imported: config.QuickSearch[];
		try {
			// Also handles exports made before bangs were renamed to quick searches
			imported = config.quickSearchesFromExport(
				migrateExport(JSON.parse(await file.text())).quickSearches,
			);
		} catch (error) {
			errorNotif(
				"Failed to import quick searches",
				`Could not import ${file.name}: ${error instanceof Error ? error.message : "invalid file"}`,
			);
			return;
		}

		setQuickSearches([...quickSearches, ...imported]);
		successNotif("Successfully imported quick searches", file.name);
	};

	return (
		<FileButton onChange={handleFileChange} accept="application/json">
			{(innerProps) => (
				<ToolbarButton
					icon={FolderUp}
					label="Import"
					title="Import from an exported JSON file"
					{...innerProps}
				/>
			)}
		</FileButton>
	);
}
