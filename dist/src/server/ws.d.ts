declare class Ws {
    private wsc;
    private url;
    private port;
    private retry_time;
    private callback;
    constructor(url: string, port: number, retry_time: number | undefined, callback: Function);
    private connect;
    send: (action: string, params?: object) => void;
    listen: (callback: Function) => void;
}
export default Ws;
