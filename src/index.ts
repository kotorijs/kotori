import { Main } from '../main';
import { api, obj } from './interface';
import ApiPrototype from './method/api';
import { EventDataType } from './method/event';

declare interface Config {
    connect: Connect
}

declare interface Connect {
    mode: 'Http' | 'Ws' | 'WsReverse',
    port: number,
    url?: string,
    reverse_port?: number,
    retry_time?: number
}


export class Kotori extends Main {
    protected config: Config = {connect: {mode: 'Http', port: 0}};
    private callback: (Event, Api: api) => void;

    public constructor(connectConfig: Connect, callback: Function) {
        super();
        this.config = {
            connect: connectConfig
        };
        this.callback = callback;
    }

    /* Connect */
    protected connectConfig: obj = new Object;
    public Api: obj = new Object;
    public Event: obj = {
        listen: (eventName: string, callback: Function) => this.EventPrototype.registerEvent(this._pluginEventList, eventName, callback)
    };
    protected connect = () => {
        this.connectConfig = {
            Http: [
                this.config.connect.url, this.config.connect.port, this.config.connect.retry_time, this.config.connect.reverse_port
            ],
            Ws: [
                this.config.connect.url, this.config.connect.port, this.config.connect.retry_time
            ],
            WsReverse: [ this.config.connect.port ]
        }
        new this.connectPrototype(...this.connectConfig[this.config.connect.mode], (connectDemo: obj) => {
            /* 接口实例化 */
            this.Api = new ApiPrototype(connectDemo.send);
            this.callback(this.Event, <api>this.Api);
            /* 监听主进程 */
            connectDemo.listen((data: EventDataType) => {
                if (!('message' in data)) return;
                /* 每次心跳时运行事件监听 */
                this.runAllEvent(data);
            });
        });
        console.info(`Current connection mode: ${this.config.connect.mode}`);
    }
    public create = () => this.run();
}

export default Kotori;