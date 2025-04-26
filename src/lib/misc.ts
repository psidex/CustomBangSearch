import { inDev } from "./esbuilddefinitions";

export default function debug(...message: Array<string | object>): void {
	if (inDev) {
		console.info(...message);
	}
}
