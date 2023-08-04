import { ConnectMethod, FuncListen, FuncSend } from "@/tools";
// import needle from "needle";

class Http implements ConnectMethod {
    public constructor(private url: string, private port: number, private reverse_port: number, private retry_time: number = 10, private callback: Function) {
        this.url, this.port, this.reverse_port, this.retry_time, this.callback;
    }

    public send: FuncSend = (action, params) => {
        JSON.stringify({ action, params });
    }

    public listen: FuncListen = callback => {
        callback;
    }
}

export default Http;