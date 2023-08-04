import { EventDataType, obj } from "@/tools/interface";

export type comType = Map<string | string[] | ((str: string) => boolean), HandlerFuncType | string>;
export type dataType = string | number | boolean | any[] | obj;
export type HandlerFuncType = (send: Function, data: EventDataType) => void;

export interface Res extends obj {
    code: 500 | 501 | 502,
    message?: string,
    data?: dataType | null
}
