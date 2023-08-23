/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-18 17:10:15
 */
import WebSocket from 'ws';
import { LOG_PREFIX } from '@/tools';
import type { ConnectCallback, ConnectMethod, FuncListen, FuncSend } from '@/tools';

class WsReverse implements ConnectMethod {
	private wss: WebSocket.Server;

	private port: number;

	private callback: ConnectCallback;

	public constructor(port: number, callback: ConnectCallback) {
		this.port = port;
		this.wss = new WebSocket.Server({ port: this.port });
		this.callback = callback;
		this.set();
	}

	private set = () => {
		this.wss.on('connection', ws => {
			console.info(LOG_PREFIX.CONNECT, 'WebSocket client successfully connected');
			this.listen = callback =>
				ws.on('message', (data: string) => {
					try {
						callback(JSON.parse(data));
					} catch (err) {
						console.error(LOG_PREFIX.CONNECT, err);
					}
				});
			this.send = (action: string, params?: object) => {
				ws.send(JSON.stringify({ action, params }));
			};
			this.callback({
				send: this.send,
				listen: this.listen,
			});

			ws.on('close', () => {
				console.warn('Client disconnected');
			});
		});
		console.info(LOG_PREFIX.CONNECT, `WebScoket server successfully established on ws://127.0.0.1:${this.port}`);
	};

	public send: FuncSend | null = null;

	public listen: FuncListen | null = null;
}

export default WsReverse;
