import Tsu from 'tsukiko';
import type { obj } from '@kotori-bot/tools';
import { type ModuleConfig, localeTypeSchema, moduleConfigBaseSchema, type AdapterConfig } from './config';

const moduleEnforceSchema = Tsu.Union([Tsu.Literal('pre'), Tsu.Literal('post')]);

export const ModulePackageSchema = Tsu.Object({
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
    enforce: moduleEnforceSchema.optional(),
    config: moduleConfigBaseSchema,
    meta: Tsu.Object({
      language: Tsu.Array(localeTypeSchema).default([]),
      service: Tsu.Array(Tsu.String()).default([])
    }).default({ language: [], service: [] })
  }).default({
    enforce: undefined,
    config: { filter: {} },
    meta: { language: [], service: [] }
  })
});

export type ModulePackage = Tsu.infer<typeof ModulePackageSchema>;

export interface ModuleInstance {
  package: ModulePackage;
  config: ModuleConfig;
  exports: obj;
  fileList: string[];
  // main: string;
}
