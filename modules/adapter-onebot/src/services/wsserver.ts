/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-02-20 20:17:46
 */
import WebSocket from 'ws';

export const WsServer = async (port: number) =>
  new Promise<[WebSocket, WebSocket.Server]>((resolve, reject) => {
    try {
      const WebSocketServer: WebSocket.Server = new WebSocket.Server({ port });
      WebSocketServer.on('connection', (ws) => {
        resolve([ws, WebSocketServer]);
      });
    } catch (e) {
      reject(e);
    }
  });

export default WsServer;
