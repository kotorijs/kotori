import vm from 'vm';
import Dir from './class.dir';

class JsBox {
	public results = '';

	protected code: string;

	protected record = (...args: unknown[]) => {
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

export default JsBox;
