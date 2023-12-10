import { CmdInfo, Cmd } from '../type';

export class Data {
	protected static cmdData: Cmd = new Map();

	protected static cmdInfoData: CmdInfo = new Map();

	protected static isErroring = false;
}

export default Data;
