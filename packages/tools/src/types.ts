/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-12 15:42:18
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-07-25 11:49:42
 */

// biome-ignore lint:
export type ObjectValue<T extends Record<string, any>> = T extends Record<string, infer V> ? V : never
export type ArrayValue<T extends unknown[]> = T extends (infer E)[] ? E : never
// biome-ignore lint:
export type ObjectArrayValue<T extends Record<string, any> | unknown[]> = T extends Record<string, any>
  ? ObjectValue<T>
  : T extends unknown[]
    ? ArrayValue<T>
    : never

type JsonArray = boolean[] | number[] | string[] | JsonMap[] | Date[]
type AnyJson = boolean | number | string | JsonMap | Date | JsonArray | JsonArray[]

export interface JsonMap {
  [key: string]: AnyJson
}
