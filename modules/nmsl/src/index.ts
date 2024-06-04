import { Context, Tsu } from 'kotori-bot';
import Translate from './translate';

export const config = Tsu.Object({
  help: Tsu.String().default('孙G在🧵帮你翻译成抽🐘话'),
  arg: Tsu.String().default('抽🐘话'),
  info: Tsu.String().default('翻译🎀果👇\n%content%\n抽象度：%score%'),
  fail: Tsu.String().default('🍺话8️⃣给让我翻译你🐴🌶️')
});

type Config = Tsu.infer<typeof config>;

export function main(ctx: Context, config: Config) {
  ctx.command(`nmsl [...${config.arg}] - ${config.help}`).action((data) => {
    const content = data.args.join('');
    if (!content) return config.fail;
    const demo = new Translate(content);
    if (!demo.result) return config.fail;
    return [config.info, { content: demo.result, score: demo.score }];
  });
}
