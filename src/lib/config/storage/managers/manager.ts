// A StorageManager can set and get an arbitrary string using it's given storage
// method. The managers are singleton objects
export default interface StorageManager {
	set(str: string): Promise<void>;
	get(): Promise<string>;
}

export const byteSize = (str: string) => new Blob([str]).size;
