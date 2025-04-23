import { inDev } from "./esbuilddefinitions";

export default function debug(message: string | object): void {
	if (inDev) {
		console.info(message);
	}
}
