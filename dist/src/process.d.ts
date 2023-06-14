/// <reference types="node" />
import Process from 'child_process';
export declare const execute: (cmd: string, args?: any[]) => Process.ChildProcess;
export declare const exec: (file: string, info?: string) => Process.ChildProcess;
declare const _default: {
    execute: (cmd: string, args?: any[] | undefined) => Process.ChildProcess;
    exec: (file: string, info?: string | undefined) => Process.ChildProcess;
};
export default _default;
