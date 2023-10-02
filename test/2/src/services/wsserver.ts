/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-09-29 17:11:24
 */
import WebSocket from 'ws';

export const WsServer = async (port: number) =>
	new Promise<WebSocket>((resolve, reject) => {
		try {
			const WebSocketServer: WebSocket.Server = new WebSocket.Server({ port });
			WebSocketServer.on('connection', ws => {
				resolve(ws);
			});
		} catch (e) {
			reject(e);
		}
	});

export default WsServer;
