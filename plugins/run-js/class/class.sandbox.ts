import vm from 'vm';
import { createEnv } from 'lua-in-js';
import Dir from './class.dir';

class Sandbox {
	public results = '';

	private code: string;

	private record = (...args: unknown[]) => {
		this.results += `${args.map(arg => {
			switch (typeof arg) {
				case 'object':
					return new Dir().dir(arg);
				case 'undefined':
					return 'undefined';
				default:
					return arg;
			}
		})}\n`;
	};

	private method = {
		console: {
			log: this.record,
			dir: this.record,
			info: this.record,
			error: this.record,
			warn: this.record,
		},
		lua: (code: string) => createEnv().parse(code).exec(),
	};

	public constructor(code: string) {
		this.code = code;
	}

	public run = () => {
		try {
			vm.runInNewContext(this.code, this.method);
		} catch (error: unknown) {
			this.results += `Uncaught SyntaxError: ${(error as Error).message}`;
		}
	};
}

export default Sandbox;
