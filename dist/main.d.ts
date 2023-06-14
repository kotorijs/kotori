import * as Lib from './src/function';
import EventPrototype from './src/method/event';
export declare class Main {
    private _const;
    private _config;
    run: () => void;
    private runGocqhttp;
    private _console;
    private rewriteConsole;
    private modeList;
    protected connectPrototype: any;
    protected connectConfig: Lib.obj;
    protected EventPrototype: EventPrototype;
    private _Api;
    private _Event;
    protected connect: () => void;
    private domainDemo;
    private catchError;
    protected _pluginEventList: [string, Function][];
    protected runAllEvent: (data: Lib.obj) => void;
    private _pluginEntityList;
    private runAllPlugin;
}
export default Main;
