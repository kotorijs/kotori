import { ColorsAdapterImpl, ColorsConfig, ColorsCustomRules, colorsIdentity } from './utils';
import { TerminalAdapter } from './adapters';
import BrowserAdapter from './adapters/browser';

export * from './utils';
export * from './adapters';

export class Colors<T extends string = ''> {
  protected readonly customRules: ColorsCustomRules<T>;

  public readonly c: ColorsAdapterImpl;

  public constructor(config: ColorsAdapterImpl | ColorsConfig<T>) {
    if ('adapter' in config) {
      this.c = config.adapter;
      this.customRules = config.rules ?? ({} as ColorsCustomRules<T>);
    } else {
      this.c = config;
      this.customRules = {} as ColorsCustomRules<T>;
    }
  }

  public parse(text: string) {
    let str = text;
    [...colorsIdentity, ...Object.keys(this.customRules), 'clear'].forEach((key) => {
      const pattern = new RegExp(`<${key}>(.*?)</${key}>`, 'g');
      if (pattern)
        str = str.replace(pattern, (_, content) =>
          this.dye(content, key as (typeof colorsIdentity)[number] | 'clear' | keyof T)
        );
    });
    return str;
  }

  public batch(batches: string[]) {
    return batches.map((batch) => this.parse(batch));
  }

  public dye(text: string, color: (typeof colorsIdentity)[number] | 'clear' | keyof T) {
    if (color in this.c) return this.c[color as (typeof colorsIdentity)[number]](text);
    if (color in this.customRules) return this.customRules[color as keyof ColorsCustomRules<T>](text);
    return this.clear(text);
  }

  public clear(text: string) {
    this.clear.toString();
    return text.replace(/* html */ /<clear>(.*?)<\/clear>/g, '$1');
  }
}

/* eslint-disable-next-line @typescript-eslint/no-namespace */
export namespace Colors {
  export function createColor<T extends string>(config: ConstructorParameters<typeof Colors<T>>[0]) {
    return new Colors<T>(config);
  }

  const instance = createColor({ adapter: !globalThis.document ? new TerminalAdapter() : new BrowserAdapter() });

  export const parse = instance.parse.bind(instance);
  export const batch = instance.batch.bind(instance);
  export const dye = instance.dye.bind(instance);
  export const clear = instance.clear.bind(instance);
}

export default Colors;
