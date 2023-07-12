import { obj } from "src/interface";

export interface Res extends obj {
    code: 500 | 501 | 502,
    message?: string,
    data?: null | string | number | boolean | any[] | obj
}