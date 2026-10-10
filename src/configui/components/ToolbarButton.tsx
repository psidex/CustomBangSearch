import { Button, type ButtonProps } from "@mantine/core";
import type { LucideIcon } from "lucide-react";
import React from "react";

interface Props extends ButtonProps {
	icon: LucideIcon;
	label: string;
	title: string;
	onClick: () => void;
	// Highlights the button, e.g. when there are changes to save
	highlight?: boolean;
}

// A button in the toolbar at the top of a tab panel
export default function ToolbarButton(props: Props) {
	const { icon: Icon, label, highlight = false, ...buttonProps } = props;
	return (
		<Button
			size="md"
			variant={highlight ? "filled" : "default"}
			color={highlight ? "green" : undefined}
			{...buttonProps}
		>
			<Icon style={{ marginRight: "0.5em" }} /> {label}
		</Button>
	);
}
