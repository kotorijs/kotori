import { LOG_PREFIX, type ConnectCallback, type ConnectMethod, type FuncListen, type FuncSend, OPTIONS } from '@/tools';
import WebSocket from 'ws';

class Ws implements ConnectMethod {
    private wsc: WebSocket;
    public constructor(private url: string, private port: number, private retry_time: number = 10, private callback: ConnectCallback) {
        this.wsc = new WebSocket(`${this.url}:${this.port}`);
        this.connect();
    }

    private connect = () => {
        this.wsc.on('error', (error: unknown) => {
            console.error(LOG_PREFIX.CONNECT, error)
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
            }, this.retry_time * 1000);
            console.warn(LOG_PREFIX.CONNECT, `Start reconnecting in ${this.retry_time} seconds...`);
        });
    }

    public send: FuncSend = (action, params) => {
        this.wsc.send(JSON.stringify({ action, params }));
    }

    public listen: FuncListen = callback => {
        this.wsc.on('message', (data: string) => {
            if (OPTIONS.catchError) {
                try {
                    callback(JSON.parse(data));
                } catch (err) {
                    console.error(LOG_PREFIX.CONNECT, err);
                }
            } else {
                callback(JSON.parse(data));
            }
        })
    }
}

export default Ws;
