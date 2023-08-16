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

export const enum SCOPE {
    ALL,
    PRIVATE,
    GROUP
}

export const enum ACCESS {
    NORMAL,
    MANGER,
    ADMIN
}

export type customMenu = obj<{
    cmd: string,
    content: string,
    scope?: SCOPE,
    access?: ACCESS
}>;

export type mapIndex = string | string[];
export type mapMatchIndex = (str: string) => boolean;
export type comType<T = HandlerFuncType | string> = Map<mapIndex | mapMatchIndex, T>;
export type cmdType = comType<cmdVal>;
export type dataType = string | number | boolean | obj | string[] | number[] | obj[];
export type HandlerFuncType = (send: Send, data: EventDataType) => void | Promise<void> | string;
export type Send = (msg: Msg, params?: obj<string | number>) => void;

export interface cmdVal {
    params?: paramInfo[] | paramInfoEx,
    description?: string,
    menuId?: string,
    scope: SCOPE,
    access: ACCESS
}

export interface paramInfo {
    must: boolean | string, name?: string, rest?: boolean
}

export interface paramInfoEx {
    [key: string]: {
        descr?: string
        args?: paramInfo[]/*  | paramInfoEx */ | null
    }
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
