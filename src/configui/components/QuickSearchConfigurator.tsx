import { Button, Divider, Group, Input, Stack, Switch } from "@mantine/core";
import { Plus, Trash, TriangleAlert } from "lucide-react";
import React, { memo } from "react";

import type * as config from "../../lib/config/config";

interface Props {
	quickSearch: config.QuickSearch;
	index: number;
	onChange: (index: number, updatedQuickSearch: config.QuickSearch) => void;
	onRemove: () => void;
	showWarning: boolean;
	lastInList: boolean;
	// If true, show advanced settings
	advancedMode: boolean;
}

// Memoized to prevent unnecessary re-renders
export default memo(QuickSearchConfigurator, (prevProps, nextProps) => {
	// Custom comparison to prevent unnecessary re-renders
	return (
		prevProps.quickSearch === nextProps.quickSearch &&
		prevProps.index === nextProps.index &&
		prevProps.showWarning === nextProps.showWarning &&
		prevProps.lastInList === nextProps.lastInList &&
		prevProps.advancedMode === nextProps.advancedMode
	);
});

function QuickSearchConfigurator(props: Props) {
	const {
		quickSearch,
		index,
		onChange,
		onRemove,
		showWarning,
		lastInList,
		advancedMode,
	} = props;

	const update = (changes: Partial<config.QuickSearch>) => {
		onChange(index, { ...quickSearch, ...changes });
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
				title="Delete this quick search"
			>
				<Trash />
			</Button>
			<Input
				value={quickSearch.keyword}
				onChange={(e) => update({ keyword: e.target.value })}
				placeholder="Keyword"
				style={{ width: "6em" }}
			/>
			{quickSearch.alias !== null ? (
				<Input
					value={quickSearch.alias}
					onChange={(e) => update({ alias: e.target.value })}
					placeholder="Alias"
					style={{ width: "6em" }}
				/>
			) : (
				<>
					<Input
						value={quickSearch.defaultUrl}
						onChange={(e) => update({ defaultUrl: e.target.value })}
						placeholder="Default URL"
						style={{ width: "10em" }}
					/>
					<Stack gap="xs">
						{quickSearch.urls.map((url) => (
							<Group key={url.id}>
								<Input
									value={url.url}
									onChange={(e) =>
										update({
											urls: quickSearch.urls.map((other) =>
												other.id === url.id
													? { ...other, url: e.target.value }
													: other,
											),
										})
									}
									placeholder="URL for query"
									style={{ width: "20em" }}
								/>
								{quickSearch.urls.length > 1 && (
									<Button
										color="red"
										variant="default"
										onClick={() =>
											update({
												urls: quickSearch.urls.filter(
													(other) => other.id !== url.id,
												),
											})
										}
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
						onClick={() =>
							update({
								urls: [
									...quickSearch.urls,
									{ id: crypto.randomUUID(), url: "" },
								],
							})
						}
						style={{ alignSelf: "flex-end" }}
						title="Add a URL to the list for this quick search"
					>
						<Plus />
					</Button>
					{advancedMode && (
						<>
							<Divider orientation="vertical" />
							<Switch
								label="Don't encode query"
								checked={quickSearch.dontEncodeQuery}
								onChange={(e) => update({ dontEncodeQuery: e.target.checked })}
								size="sm"
								style={{ alignSelf: "center" }}
							/>
						</>
					)}
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
