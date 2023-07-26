export type resCodeType = 500 | 501 | 502 | 503 | 504;
export type resMessageType = 'success' | 'fail:parameter cannot be empty' | 'fail:parameter error' | 'fail:error' | 'fail:server reject' | string;

export interface resData {
    code: resCodeType
    message: resMessageType
    data: object | null | object[]
}

export type expressAppCallback = (req: object, res: expressAppRes) => unknown;
export type expressAppRouter = (path: string, callback: expressAppCallback) => unknown;

export interface expressAppRes {
    status: (code: number) => expressAppCallback
}

export interface expressAppResStatus {
    send: object
}

export interface expressApp {
    get: expressAppRouter,
    post: expressAppRouter,
    use: (path: string, bind: object) => unknown
}

export interface Token {
    token: string
}