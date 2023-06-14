export interface obj {
    [key: string]: any;
}
export declare const _const: obj;
export declare function loadConfig(filename: string, type?: 'json' | 'yaml' | 'xml' | 'ini'): any;
export declare function saveConfig(filename: string, data: obj, type?: 'json' | 'yaml' | 'xml' | 'ini'): void;
export declare function stringProcess(str: string | number, key: string | number | Array<string | number>, mode?: 0 | 1 | 2): boolean;
export declare function arrayProcess(arr: (string | number)[], key: string | number | Array<string | number>, mode?: 0 | 1 | 2): boolean;
export declare function stringSplit(str: string, key: string): string;
export declare function formatTime(time?: Date | null, format?: Number): string;
export declare class _console {
    private static colorList;
    static prefixColor: string;
    static logsFilePath: string;
    static originalLog: (__console: Function, type: string, typeColor: string, textColor: string, ...args: obj[]) => void;
    static log: (__console: Function, ...args: any) => void;
    static info: (__console: Function, ...args: any) => void;
    static warn: (__console: Function, ...args: any) => void;
    static error: (__console: Function, ...args: any) => void;
}
export declare class request {
    static send: (type: 'get' | 'post', url: string, params?: obj) => Promise<unknown>;
    static get: (url: string, params?: obj) => Promise<unknown>;
    static post: (url: string, params?: obj) => Promise<unknown>;
}
export declare function getPackageInfo(): any;
declare const _default: {
    _const: obj;
    loadConfig: typeof loadConfig;
    stringProcess: typeof stringProcess;
    arrayProcess: typeof arrayProcess;
    stringSplit: typeof stringSplit;
    _console: typeof _console;
    request: typeof request;
};
export default _default;
