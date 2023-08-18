/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-26 14:50:47
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-18 18:06:51
 */
import { cmdType, comType } from './interface';

export const enum URL {
	API = 'https://api.imlolicon.tk/api/',
	BLOG = 'https://imlolicon.tk/api/',
	GPT = 'http://chatgpt.imlolicon.tk/v1/chat/completions',
	BGM = 'https://api.bgm.tv/',
}

export const HEADER: string = 'Kotori-Bot:';

export const Com: comType = new Map();
export const MenuInfo: Map<string, string | string[]> = new Map();
export const CmdInfo: cmdType = new Map();

export default Com;
