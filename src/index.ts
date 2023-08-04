/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-07-28 11:36:32
 */
import { Main } from '@/../main';
import { Api, Event, obj, EventDataType, FuncAppCallback, ConnectConfig } from '@/tools';
import ApiPrototype from '@/utils/class.api';

interface Config {
    connect: ConnectConfig
}

export class Kotori extends Main {
    protected config: Config = {connect: {mode: 'Http', port: 0}};
    private callback: FuncAppCallback;

    public constructor(connectConfig: ConnectConfig, callback: FuncAppCallback) {
        super();
        this.config = {
            connect: connectConfig
        };
        this.callback = callback;
    }

    /* Connect */
    protected connectConfig: Object = new Object;
    public Api: Object = new Object;
    public Event: Event = {
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
            this.Api = <Api>new ApiPrototype(connectDemo.send);
            this.callback(this.Event, <Api>this.Api);
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
