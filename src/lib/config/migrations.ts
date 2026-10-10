//
// NOTE: This file is Claude slop. I am confident it works, but it's ugly.
//

//
// Migrations for stored configs and exported files from older config versions.
// This file must not import anything that depends on the browser, so that it
// can be unit tested in Node.
//

import debug from "../misc";
import * as config from "./config";

/**
 * Thrown when a config was created by a newer version of the extension than
 * this one, e.g. it was synced from another browser that has already updated.
 * Callers must not overwrite a config that caused this error.
 */
export class NewerConfigVersionError extends Error {
	constructor(version: number) {
		super(
			`Config version ${version} is newer than the supported version ${config.currentConfigVersion}, please update Custom Quick Search`,
		);
		this.name = "NewerConfigVersionError";
	}
}

// biome-ignore lint/suspicious/noExplicitAny: Migrations deal with untyped JSON
type Migration = (old: any) => any;

// Keyed by the version being migrated from. Each migration must return an
// object with version set to the next version. Migrations apply to both stored
// configs and exports, so options may not be present.
const migrations: Record<number, Migration> = {
	// v7 renamed "bangs" to "quick searches", and added advanced mode
	6: ({ bangs, ...rest }) => {
		const migrated = { ...rest, version: 7, quickSearches: bangs };
		if (typeof rest.options === "object" && rest.options !== null) {
			const { ignoreBangCase, ...options } = rest.options;
			migrated.options = {
				...options,
				ignoreKeywordCase: ignoreBangCase,
				// Advanced settings are hidden unless advanced mode is on, so turn it
				// on for anyone already using them
				advancedMode:
					Array.isArray(bangs) &&
					bangs.some(
						(bang: { dontEncodeQuery?: unknown }) =>
							bang?.dontEncodeQuery === true,
					),
			};
		}
		return migrated;
	},
};

// biome-ignore lint/suspicious/noExplicitAny: Migrations deal with untyped JSON
function migrate(parsed: unknown): any {
	if (
		parsed === null ||
		typeof parsed !== "object" ||
		!("version" in parsed) ||
		typeof parsed.version !== "number" ||
		!Number.isInteger(parsed.version)
	) {
		throw new Error("The given JSON has no version");
	}

	if (parsed.version > config.currentConfigVersion) {
		throw new NewerConfigVersionError(parsed.version);
	}

	// biome-ignore lint/suspicious/noExplicitAny: Migrations deal with untyped JSON
	let migrated: any = parsed;
	while (migrated.version < config.currentConfigVersion) {
		debug(`Running migration for version: ${migrated.version}`);
		const migration = migrations[migrated.version];
		if (migration === undefined) {
			throw new Error(`Config version ${migrated.version} is not supported`);
		}
		migrated = migration(migrated);
	}
	return migrated;
}

/**
 * Migrates a parsed stored config to the current config version.
 * @param parsed The parsed JSON of a stored config.
 * @returns The config in the current format.
 * @throws NewerConfigVersionError if the config is from a newer version.
 * @throws Error if the config can't be migrated or is not a valid config.
 */
export function migrateConfig(parsed: unknown): config.Config {
	const migrated = migrate(parsed);
	if (
		typeof migrated.options !== "object" ||
		migrated.options === null ||
		!Array.isArray(migrated.quickSearches)
	) {
		throw new Error("The given JSON is not a valid Config");
	}
	return migrated as config.Config;
}

/**
 * Migrates a parsed exported file to the current config version.
 * @param parsed The parsed JSON of an exported file.
 * @returns The export in the current format.
 * @throws NewerConfigVersionError if the export is from a newer version.
 * @throws Error if the export can't be migrated or is not a valid export.
 */
export function migrateExport(parsed: unknown): config.QuickSearchesExport {
	const migrated = migrate(parsed);
	if (!Array.isArray(migrated.quickSearches)) {
		throw new Error("The given JSON is not a valid export");
	}
	return migrated as config.QuickSearchesExport;
}
