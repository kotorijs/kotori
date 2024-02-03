import type { Core } from '../components';

export type CoreConfig = Exclude<ConstructorParameters<typeof Core>[0], undefined>;
export type KotoriConfig = CoreConfig['config'];
export type AdapterConfig = KotoriConfig['adapter'][0];
export type ModuleConfig = KotoriConfig['plugin'][0];
