import React from "react";

import { notifications } from "@mantine/notifications";
import { Check, X } from "lucide-react";

export function successNotif(title: string, message: string): void {
	notifications.show({
		title: title,
		message: message,
		autoClose: true,
		icon: <Check />,
		color: "green",
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
