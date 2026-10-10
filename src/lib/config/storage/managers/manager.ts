// A StorageManager can set and get an arbitrary string using its given storage
// method. The managers are singleton objects
export default interface StorageManager {
	// Replaces the stored string. Not guaranteed to be transactional, if this
	// throws then the stored data may be corrupt.
	set(str: string): Promise<void>;
	// Gets the stored string. Throws or returns an invalid string (e.g. "") if
	// nothing valid is stored.
	get(): Promise<string>;
	// Removes everything this manager has stored.
	clear(): Promise<void>;
	// Returns true if nothing is stored.
	isEmpty(): Promise<boolean>;
}
