import path from 'path';
import { ConnectCallback, ConnectMethod, FuncListen, FuncSend } from '@/tools';

class Http implements ConnectMethod {
	private url: string;

	private port: number;

	private reversePort: number;

	private retryTime: number;

	private callback: ConnectCallback;

	public constructor(url: string, port: number, reversePort: number, retryTime: number, callback: ConnectCallback) {
		this.url = url;
		this.port = port;
		this.reversePort = reversePort;
		this.retryTime = retryTime || 10;
		this.callback = callback;
		this.handle();
	}

	private handle = () => {
		path.join(
			this.url,
			this.port.toString(),
			this.reversePort.toString(),
			this.retryTime.toString(),
			this.callback.toString(),
		);
	};

	public send: FuncSend = (action, params) => {
		JSON.stringify({ action, params, url: this.url });
	};

	public listen: FuncListen = callback => {
		this.handle();
		const newCallback = callback;
		return newCallback;
	};
}

export default Http;
