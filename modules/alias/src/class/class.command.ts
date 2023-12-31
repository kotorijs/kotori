import { ACCESS, CoreKeyword, InfoVal, InfoValArg, SCOPE } from '../type';
import Data from './class.data';

export class Command extends Data {
	private keyword: CoreKeyword;

	private info: InfoVal;

	public constructor(keyword: CoreKeyword, info: InfoVal) {
		super();
		this.keyword = keyword;
		this.info = info;
	}

	private handle() {
		Command.cmdInfoData.set(this.keyword, this.info);
		return this;
	}

	public menuId(val: string) {
		this.info.menuId = val;
		return this.handle();
	}

	public help(help: string) {
		this.info.help = help;
		return this.handle();
	}

	public scope(scope: SCOPE) {
		this.info.scope = scope;
		return this.handle();
	}

	public access(access: ACCESS) {
		this.info.access = access;
		return this.handle();
	}

	public params(params: InfoValArg) {
		this.info.params = params;
		return this.handle();
	}
}

export default Command;
