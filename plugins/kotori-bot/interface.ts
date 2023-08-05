import { EventDataType, Msg, obj } from "@/tools/interface";

export type comType = Map<string | string[] | ((str: string) => boolean), HandlerFuncType | string>;
export type dataType = string | number | boolean | obj | string[] | number[] | obj[];
export type HandlerFuncType = (send: Send, data: EventDataType) => void;

export type Send = (msg: Msg) => void;

export interface Res<T = dataType | null> extends obj {
    code: 500 | 501 | 502,
    message?: string,
    data?: T
}

export interface ResAfter extends Res {
    code: 500,
    data: dataType
}