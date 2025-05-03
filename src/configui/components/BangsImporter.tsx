import React, { type ChangeEvent, useRef } from "react";
import { Button } from "@mantine/core";
import { FolderUp } from "lucide-react";

import { errorNotif, successNotif } from "../notifications";
import * as config from "../../lib/config/config";
import * as legacy from "../../lib/config/legacy/legacy";

interface Props {
	bangInfos: config.BangInfo[];
	setBangInfos: (newBangs: config.BangInfo[]) => void;
}

export default function BangFileUploader(props: Props) {
	const { bangInfos, setBangInfos } = props;

	const fileInputRef = useRef<HTMLInputElement>(null);

	const uploadButtonClicked = () => {
		if (fileInputRef.current !== null) {
			fileInputRef.current.click();
		}
	};

	const handleFileChange = async (
		e: ChangeEvent<HTMLInputElement>,
	): Promise<void> => {
		if (e.target.files === null) {
			return;
		}

		const file: File = e.target.files[0];
		if (!file) {
			return;
		}

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

		if (
			typeof uploaded !== "object" ||
			uploaded === null ||
			typeof uploaded.version !== "number" ||
			uploaded.bangs === undefined
		) {
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

	return (
		<>
			<Button
				onClick={uploadButtonClicked}
				size="md"
				variant="default"
				title="Import from an exported JSON file"
			>
				<FolderUp style={{ marginRight: "0.5em" }} /> Import
			</Button>
			<input
				ref={fileInputRef}
				type="file"
				accept="application/json"
				style={{ display: "none" }}
				onChange={handleFileChange}
			/>
		</>
	);
}
