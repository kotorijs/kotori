/*
export function isenv() {
	return process && process.version;
}

interface FsModule {
	existsSync(path: string): boolean;
	statSync(path: string): { isDirectory(): boolean } | undefined;
	readFileSync(path: string): { toString(): string } | undefined | null;
}
/

export class NodeFs {
	private static fs?: FsModule;

	private static async require() {
		if (!this.fs) this.fs = await import('fs');
		return this.fs;
	}

	static get() {
		if (!isenv) throw new Error('is not nodejs environment,cant load locale file');
		return this.require();
	}
}
*/
