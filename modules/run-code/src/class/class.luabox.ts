import { createEnv } from 'lua-in-js';
import JsBox from './class.jsbox';

class LuaBox extends JsBox {
	public run = () => {
		const backupLog = console.log;
		setTimeout(() => {
			const timer = setInterval(() => {
				if (backupLog === console.log) clearInterval(timer);
				console.log = backupLog;
			}, 900);
		}, 900);
		try {
			console.log = this.record;
			createEnv().parse(this.code).exec();
		} catch (error: unknown) {
			this.results += `Uncaught SyntaxError: ${(error as Error).message}`;
		}
	};
}

export default LuaBox;
