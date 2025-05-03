import React, { memo } from "react";
import { Button, Divider, Group, Input, Stack, Switch } from "@mantine/core";
import { Plus, Trash, TriangleAlert } from "lucide-react";

import type * as config from "../../lib/config/config";

interface Props {
	bang: config.BangInfo;
	index: number;
	onChange: (index: number, updatedBang: config.BangInfo) => void;
	onRemove: () => void;
	showWarning: boolean;
	lastInList: boolean;
}

// Memoized to prevent unnecessary re-renders
export default memo(
	function BangConfigurator({
		bang,
		index,
		onChange,
		onRemove,
		showWarning,
		lastInList,
	}: Props) {
		return (
			<RealBangConfigurator
				bang={bang}
				index={index}
				onChange={onChange}
				onRemove={onRemove}
				showWarning={showWarning}
				lastInList={lastInList}
			/>
		);
	},
	(prevProps, nextProps) => {
		// Custom comparison to prevent unnecessary re-renders
		return (
			prevProps.bang === nextProps.bang &&
			prevProps.index === nextProps.index &&
			prevProps.showWarning === nextProps.showWarning &&
			prevProps.lastInList === nextProps.lastInList
		);
	},
);

function RealBangConfigurator(props: Props) {
	const { bang, index, onChange, onRemove, showWarning, lastInList } = props;

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
		if (bang.urls.length === 1) {
			// Don't allow zero-length URL array
			return;
		}
		const updatedBang = {
			...bang,
			urls: bang.urls.filter((url) => url.id !== urlId),
		};
		onChange(index, updatedBang);
	};

	return (
		<Group
			style={{
				alignItems: "flex-start",
				// NOTE: I wanted to use margin here but it doesn't play nicely with
				// scrolling the Virtuoso window on Firefox
				paddingTop: index === 0 ? "0.5em" : "1em",
				paddingBottom: lastInList ? "1em" : "",
			}}
		>
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
				placeholder="Keyword"
				style={{ width: "6em" }}
			/>
			{bang.alias !== null && (
				<Input
					value={bang.alias}
					onChange={(e) => handleChange("alias", e.target.value)}
					placeholder="Alias"
					style={{ width: "6em" }}
				/>
			)}
			{bang.alias === null && (
				<>
					<Input
						value={bang.defaultUrl}
						onChange={(e) => handleChange("defaultUrl", e.target.value)}
						placeholder="Default URL"
						style={{ width: "10em" }}
					/>
					<Stack gap="xs">
						{bang.urls.map((url, i) => (
							<Group key={url.id}>
								<Input
									value={url.url}
									onChange={(e) => handleUrlChange(url.id, e.target.value)}
									placeholder={"URL for query"}
									style={{ width: "20em" }}
								/>
								{bang.urls.length > 1 && (
									<Button
										color="red"
										variant="default"
										onClick={() => handleRemoveUrl(url.id)}
										title="Delete this URL from the list"
									>
										<Trash />
									</Button>
								)}
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
					<Divider orientation="vertical" />
					<Switch
						label="Don't encode query"
						checked={bang.dontEncodeQuery}
						onChange={(e) => handleChange("dontEncodeQuery", e.target.checked)}
						size="sm"
						style={{ alignSelf: "center" }}
					/>
				</>
			)}
			{showWarning && (
				<TriangleAlert
					style={{ alignSelf: "center" }}
					color="rgb(253, 126, 20)"
				/>
			)}
		</Group>
	);
}
