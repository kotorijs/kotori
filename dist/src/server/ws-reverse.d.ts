declare class WsReverse {
    private wss;
    private port;
    private callback;
    constructor(port: number, callback: Function);
    private set;
    send: Function;
    listen: Function;
}
export default WsReverse;
