import { obj } from './function';
export declare const load: (pluginName: string) => Promise<any>;
export declare const loadAll: () => Set<[Promise<obj>, string, string, (obj | undefined)?]>;
declare const _default: {
    load: (pluginName: string) => Promise<any>;
    loadAll: () => Set<[Promise<obj>, string, string, (obj | undefined)?]>;
};
export default _default;
