import React, { memo } from "react";
import { Button, Group, Input, Stack, Switch } from "@mantine/core";
import { Plus, Trash } from "lucide-react";

import type * as config from "../../lib/config/config";

export interface Props {
	bang: config.BangInfo;
	index: number;
	onChange: (index: number, updatedBang: config.BangInfo) => void;
	onRemove: () => void;
}

// Use memo because this is likely to be re-rendered with the same props a lot
export default memo(function BangConfigurator(props: Props) {
	const { bang, index, onChange, onRemove } = props;

	// Handle changes to input fields
	const handleChange = (
		field: keyof config.BangInfo,
		value: string | boolean,
	) => {
		const updated = { ...bang, [field]: value };
		onChange(index, updated);
	};

	// Handle changes specifically for URLs
	const handleUrlChange = (urlId: string, newUrl: string) => {
		const updatedBang = {
			...bang,
			urls: bang.urls.map((url) =>
				url.id === urlId ? { ...url, url: newUrl } : url,
			),
		};
		onChange(index, updatedBang);
	};

	// Add a new URL to the list
	const handleAddUrl = () => {
		const newUrl = { id: crypto.randomUUID(), url: "" };
		const updatedBang = { ...bang, urls: [...bang.urls, newUrl] };
		onChange(index, updatedBang);
	};

	// Remove a URL from the list
	const handleRemoveUrl = (urlId: string) => {
		const updatedBang = {
			...bang,
			urls: bang.urls.filter((url) => url.id !== urlId),
		};
		onChange(index, updatedBang);
	};

	return (
		<Group style={{ alignItems: "flex-start" }}>
			<Button
				color="red"
				variant="light"
				onClick={onRemove}
				title="Delete this bang"
			>
				<Trash />
			</Button>
			<Input
				value={bang.keyword}
				onChange={(e) => handleChange("keyword", e.target.value)}
				placeholder="Bang"
				style={{ width: "4em" }}
			/>
			<Input
				value={bang.alias}
				onChange={(e) => handleChange("alias", e.target.value)}
				placeholder="Alias"
				style={{ width: "4em" }}
			/>
			<Input
				value={bang.defaultUrl}
				onChange={(e) => handleChange("defaultUrl", e.target.value)}
				placeholder="Default URL"
				style={{ width: "15em" }}
			/>
			<Stack>
				{bang.urls.map((url, i) => (
					<Group key={url.id}>
						<Input
							value={url.url}
							onChange={(e) => handleUrlChange(url.id, e.target.value)}
							placeholder={`URL ${i + 1}`}
							style={{ width: "15em" }}
						/>
						<Button
							color="red"
							variant="light"
							onClick={() => handleRemoveUrl(url.id)}
							title="Delete this URL from this bangs list"
						>
							<Trash />
						</Button>
					</Group>
				))}
			</Stack>
			<Button
				variant="light"
				onClick={handleAddUrl}
				style={{ alignSelf: "flex-end" }}
				title="Add a URL to the list for this bang"
			>
				<Plus />
			</Button>
			<Switch
				label="Don't encode query"
				checked={bang.dontEncodeQuery}
				onChange={(e) => handleChange("dontEncodeQuery", e.target.checked)}
				size="sm"
				style={{ alignSelf: "center" }}
				// TODO: This doesn't seem to show up, maybe add a question mark / tooltip thing?
				title="If on, the query inserted into the URL(s) wont be run through encodeURIComponent"
			/>
		</Group>
	);
});
