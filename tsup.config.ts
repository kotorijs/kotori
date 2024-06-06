import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'tsup';

export default defineConfig(() => {
  const cwd = process.cwd();
  const tsconfig = existsSync(resolve(cwd, 'tsconfig.json'))
    ? JSON.parse(readFileSync(resolve(cwd, 'tsconfig.json')).toString())
    : undefined;
  return {
    entryPoints: ['./src'],
    minify: true,
    outDir: tsconfig?.compilerOptions?.outDir ?? './dist'
  };
});
