import React, { useEffect, useState } from "react";
import browser from "webextension-polyfill";
import { Button } from "@mantine/core";

import { hostPermissions } from "../esbuilddefinitions";

const requestedPermissions = { origins: hostPermissions };

export default function PermissionsRequester() {
	const [hasPermissions, setHasPermissions] = useState<boolean>(false);

	useEffect(() => {
		browser.permissions.contains(requestedPermissions).then(setHasPermissions);
	}, []);

	const clicked = async () => {
		await browser.permissions.request(requestedPermissions);
		window.location.reload();
	};

	if (hasPermissions) {
		return null;
	}

	return (
		<Button variant="filled" color="red" size="lg" onClick={clicked}>
			Enable Required Permissions
		</Button>
	);
}
