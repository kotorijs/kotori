import WebSocket from 'ws';

class Ws {
    private wsc;
    private url;
    private port;
    private retry_time;
    private callback;
    public constructor(url: string, port: number, retry_time: number = 10, callback: Function) {
        this.url = url;
        this.port = port;
        this.retry_time = retry_time;
        this.wsc = new WebSocket(`${this.url}:${this.port}`);
        this.callback = callback;
        this.connect();
    }

    private connect = () => {
        this.wsc.on('error', (error: any) => {
            console.error(error)
        });
        this.wsc.on('open', () => {
            this.callback({ send: this.send, listen: this.listen });
            console.info('WebSocket server successfully connected');
        });
        this.wsc.on('close', () => {
            setTimeout(() => {
                this.wsc.close();
                this.wsc = new WebSocket(`${this.url}:${this.port}`);
                this.connect();
            }, this.retry_time * 1000);
            console.warn(`Start reconnecting in ${this.retry_time} seconds...`);
        });
    }

    public send = (action: string, params?: object) => {
        this.wsc.send(JSON.stringify({ action, params }));
    }

    public listen = (callback: Function) => {
        this.wsc.on('message', (data: string) => {
            try {
                callback(JSON.parse(data))
            } catch (e) {
                console.error(e, 111)
            }
        })
    }
}

export default Ws;
