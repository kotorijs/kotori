import Tsu from 'tsukiko';
import type { obj } from '@kotori-bot/tools';
import { type ModuleConfig, localeTypeSchema } from './config';
import type { EventDataBase } from './core';

declare module './core' {
  interface EventsList {
    ready: EventDataReady;
    error: EventDataError;
    dispose: EventDataDispose;
  }
}

interface EventDataReady extends EventDataBase<'ready'> {
  module?: ModuleInstance /* | string */;
  state?: boolean;
}

interface EventDataError extends EventDataBase<'error'> {
  error: Error;
}

interface EventDataDispose extends EventDataBase<'dispose'> {
  module?: ModuleInstance /* | string */;
}

export const modulePackageSchema = Tsu.Object({
  name: Tsu.String().regexp(/kotori-plugin-[a-z]([a-z,0-9]{3,13})\b/),
  version: Tsu.String(),
  description: Tsu.String(),
  main: Tsu.String(),
  license: Tsu.Literal('GPL-3.0'),
  author: Tsu.Union([Tsu.String(), Tsu.Array(Tsu.String())]),
  peerDependencies: Tsu.Object({
    'kotori-bot': Tsu.String()
  }),
  kotori: Tsu.Object({
    enforce: Tsu.Union([Tsu.Literal('pre'), Tsu.Literal('post')]).optional(),
    meta: Tsu.Object({
      language: Tsu.Array(localeTypeSchema).default([]),
      service: Tsu.Array(Tsu.String()).default([])
    }).default({ language: [], service: [] })
  }).default({
    enforce: undefined,
    meta: { language: [], service: [] }
  })
});

export type ModulePackage = Tsu.infer<typeof modulePackageSchema>;

export interface ModuleInstance {
  package: ModulePackage;
  config: ModuleConfig;
  exports: obj;
  fileList: string[];
  // main: string;
}
