export const colorsIdentity = [
  'reset',
  'bold',
  'dim',
  'italic',
  'underline',
  'inverse',
  'hidden',
  'strikethrough',
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
  'gray',
  'bgBlack',
  'bgRed',
  'bgGreen',
  'bgYellow',
  'bgBlue',
  'bgMagenta',
  'bgCyan',
  'bgWhite',
  'blackBright',
  'redBright',
  'greenBright',
  'yellowBright',
  'blueBright',
  'magentaBright',
  'cyanBright',
  'whiteBright',
  'bgBlackBright',
  'bgRedBright',
  'bgGreenBright',
  'bgYellowBright',
  'bgBlueBright',
  'bgMagentaBright',
  'bgCyanBright',
  'bgWhiteBright'
] as const;

type ColorsAdapterReflect = {
  [K in (typeof colorsIdentity)[number]]: (content: string) => string;
};

export interface ColorsAdapterImpl extends ColorsAdapterReflect {}

export type ColorsCustomRules<T extends string> = Record<T, (text: string) => string>;

export interface ColorsConfig<T extends string> {
  adapter: ColorsAdapterImpl;
  rules?: ColorsCustomRules<T>;
}
