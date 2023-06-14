import { Main } from '../main';
import { obj } from './function';
declare interface Config {
    connect: Connect;
}
declare interface Connect {
    mode: 'Http' | 'Ws' | 'WsReverse';
    port: number;
    url?: string;
    reverse_port?: number;
    retry_time?: number;
}
export declare class Kotori extends Main {
    protected config: Config;
    private callback;
    constructor(connectConfig: Connect, callback: Function);
    protected connectConfig: obj;
    Api: obj;
    Event: obj;
    protected connect: () => void;
    create: () => void;
}
export default Kotori;
