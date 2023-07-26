import { obj } from "@/interface";
import { resCodeType, resMessageType, resData, Token } from "./interface";
import { _const, getRandomStr, loadConfig, saveConfig } from "@/function";

export const resMessageList = {
    500: 'success',
    501: 'fail:parameter cannot be empty',
    502: 'fail:parameter error',
    503: 'fail:error',
    504: 'fail:server reject'
}

export const handle = (res: obj, data: object | null, code: resCodeType = 500, message?: resMessageType): void => {
    const response: resData = {
        code, message: message ? message : resMessageList[code], data
    };
    res.status(200).send(response);
}

export const verify = (token: string | undefined | null): boolean => {
    return !(token === (<Token>loadConfigP('token.json')).token);
}

export const log = (...params: unknown[]) => console.log('[WEB]', ...params);

const configPath = `${_const._DATA_PATH}\\kotori-bot-admin-server\\`;
export const loadConfigP = (filename: string) => loadConfig(`${configPath}${filename}`);
export const saveConfigP = (filename: string, content: object) => saveConfig(`${configPath}${filename}`, content);
export const updateToken = () => saveConfigP('token.json', { token: getRandomStr() });