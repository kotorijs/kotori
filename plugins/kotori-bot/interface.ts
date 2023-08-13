import { EventDataType, Msg, obj } from "@/tools/interface";

export const enum RES_CODE {
    SUCCESS = 500,
    ARGS_EMPTY,
    ARGS_ERROR
}

export const enum CONTROL_PARAMS {
    QUERY = 'query',
    ADD = 'add',
    DEL = 'del'
}

export enum ACCESS {
    NORMAL,
    MANGER,
    ADMIN
}

export type customMenu = obj<{
    cmd: string,
    content: string,
    scope?: scopeType,
    access?: ACCESS
}>;
export type scopeType = 'all' | 'private' | 'group';
export type mapIndex = string | string[]/*  | ((str: string) => boolean) */;
export type comType<T = HandlerFuncType | string> = Map<mapIndex, T>;
export type cmdType = comType<{
    params?: paramInfo[], description?: string, menuId?: string, scope: scopeType, access: ACCESS 
}>;
export type dataType = string | number | boolean | obj | string[] | number[] | obj[];
export type HandlerFuncType = (send: Send, data: EventDataType) => void | Promise<void> | string;

export type Send = (msg: Msg, params?: obj<string | number>) => void;

export interface paramInfo {
    must: boolean | string, name?: string,
}

export interface Res<T = dataType | null> extends obj {
    code: 500 | 501 | 502,
    message?: string,
    data?: T
}

export interface ResAfter extends Res {
    code: 500,
    data: dataType
}
