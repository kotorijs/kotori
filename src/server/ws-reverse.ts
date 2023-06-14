import WebSocket from 'ws';

class WsReverse {
    private wss;
    private port;
    private callback;
    public constructor(port: number, callback: Function) {
        this.port = port;
        this.wss = new WebSocket.Server({ port: this.port });
        this.callback = callback;
        this.set();
    }

    private set = () => {
        this.wss.on('connection', (ws: WebSocket.WebSocket) => {
            console.info('WebSocket client successfully connected');
            this.listen = (callback: Function) => ws.on('message', (data: string) => {
                try {
                    callback(JSON.parse(data))
                } catch (e) {
                    console.log(e)
                }
            });
            this.send = (action: string, params?: object) => {
                ws.send(JSON.stringify({ action, params }))
            }
            this.callback({ send: this.send, listen: this.listen });
        });
        console.info(`WebScoket server successfully established on ws://127.0.0.1:${this.port}`);
    }

    public send: Function = Function;
    public listen: Function = Function;
}

export default WsReverse;
