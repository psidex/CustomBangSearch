import { notifications } from "@mantine/notifications";
import { Check, X } from "lucide-react";
import React from "react";

export function successNotif(title: string, message: string): void {
	notifications.show({
		title: title,
		message: message,
		autoClose: true,
		icon: <Check />,
		color: "green",
	});
}

/**
 * Shows a loading notification whilst saving, then updates it to show if
 * saving succeeded or failed.
 * @param what What is being saved, in lower case, e.g. "options".
 * @param save Saves, throwing an Error if saving fails.
 */
export async function saveWithNotif(
	what: string,
	save: () => Promise<void>,
): Promise<void> {
	const id = notifications.show({
		title: `Saving ${what}...`,
		message: "",
		loading: true,
		autoClose: false,
		withCloseButton: false,
	});

	try {
		await save();
	} catch (error) {
		notifications.update({
			id,
			title: `Failed to save ${what}`,
			message: error instanceof Error ? error.message : "",
			autoClose: true,
			icon: <X />,
			color: "red",
			loading: false,
		});
		return;
	}

	notifications.update({
		id,
		title: `${what[0].toUpperCase()}${what.slice(1)} saved`,
		message: "",
		autoClose: true,
		icon: <Check />,
		color: "green",
		loading: false,
	});
}

export function errorNotif(title: string, message: string): void {
	notifications.show({
		title: title,
		message: message,
		autoClose: true,
		icon: <X />,
		color: "red",
	});
}
