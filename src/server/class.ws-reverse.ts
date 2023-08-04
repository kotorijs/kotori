/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-07-31 16:57:44
 */
import { type FuncListen, type FuncSend, type ConnectMethod, type ConnectCallback, LOG_PREFIX, OPTIONS } from '@/tools';
import WebSocket from 'ws';

class WsReverse implements ConnectMethod {
    private wss: WebSocket.Server;
    public constructor(private port: number, private callback: ConnectCallback) {
        this.port = port;
        this.wss = new WebSocket.Server({ port: this.port });
        this.callback = callback;
        this.set();
    }

    private set = () => {
        this.wss.on('connection', ws => {
            console.info(LOG_PREFIX.CONNECT, 'WebSocket client successfully connected');
            this.listen = callback => ws.on('message', (data: string) => {
                if (OPTIONS.catchError) {
                    try {
                        callback(JSON.parse(data));
                    } catch (err) {
                        console.error(LOG_PREFIX.CONNECT, (err as any).toString(), typeof err)
                    }
                } else {
                    callback(JSON.parse(data));
                }
            });
            this.send = (action: string, params?: object) => {
                ws.send(JSON.stringify({ action, params }))
            }
            this.callback({
                send: this.send,
                listen: this.listen
            });
        });
        console.info(LOG_PREFIX.CONNECT, `WebScoket server successfully established on ws://127.0.0.1:${this.port}`);
    }

    public send: FuncSend = () => {};
    public listen: FuncListen = () => {};
}

export default WsReverse;