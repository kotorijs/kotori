import { Adapter, Api } from '@kotori-bot/kotori';
import QQApi from './api';

export default class QQAdapter extends Adapter {
	protected Api: Api;

	public constructor(config: object) {
		super(config);
		this.Api = new QQApi(this);
	}

	public handle = () => this;

	public start = () => this;

	public stop = () => this;
}
