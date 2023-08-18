import WebSocket from 'ws';
import { LOG_PREFIX } from '@/tools';
import type { ConnectCallback, ConnectMethod, FuncListen, FuncSend } from '@/tools';

class Ws implements ConnectMethod {
	private wsc: WebSocket;

	private url: string;

	private port: number;

	private retryTime: number;

	private callback: ConnectCallback;

	public constructor(url: string, port: number, retryTime: number, callback: ConnectCallback) {
		this.url = url;
		this.port = port;
		this.retryTime = retryTime || 10;
		this.callback = callback;
		this.wsc = new WebSocket(`${this.url}:${this.port}`);
		this.connect();
	}

	private connect = () => {
		this.wsc.on('error', (error: unknown) => {
			console.error(LOG_PREFIX.CONNECT, error);
		});
		this.wsc.on('open', () => {
			this.callback({ send: this.send, listen: this.listen });
			console.info(LOG_PREFIX.CONNECT, 'WebSocket server successfully connected');
		});
		this.wsc.on('close', () => {
			setTimeout(() => {
				this.wsc.close();
				this.wsc = new WebSocket(`${this.url}:${this.port}`);
				this.connect();
			}, this.retryTime * 1000);
			console.warn(LOG_PREFIX.CONNECT, `Start reconnecting in ${this.retryTime} seconds...`);
		});
	};

	public send: FuncSend = (action, params) => {
		this.wsc.send(JSON.stringify({ action, params }));
	};

	public listen: FuncListen = callback => {
		this.wsc.on('message', (data: string) => {
			try {
				callback(JSON.parse(data));
			} catch (err) {
				console.error(LOG_PREFIX.CONNECT, err);
			}
		});
	};
}

export default Ws;
