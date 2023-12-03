/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-12 15:42:18
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-11-09 21:29:40
 */

export interface obj<T = any> {
	[propName: string]: T;
}

export type ConfigFileType = 'json' | 'yaml' /* | 'xml' | 'ini'  */ | 'txt';
export type FuncStringProcessStr = string | number;
export type FuncStringProcessKey = FuncStringProcessStr | Array<string | number>;
export type FuncStringProcessMode = 0 | 1 | 2;
export type StringTempArgs = obj<string | number | void>;

export type ObjectValue<T extends obj> = T extends obj<infer V> ? V : never;
export type ArrayValue<T extends unknown[]> = T extends (infer E)[] ? E : never;
export type ObjectArrayValue<T extends obj | unknown[]> = T extends obj
	? ObjectValue<T>
	: T extends unknown[]
	? ArrayValue<T>
	: never;
