import { type Adapter, type Context, Symbols, ModuleConfig, Tsu, stringRightSplit, PLUGIN_PREFIX } from 'kotori-bot';
import path, { resolve } from 'path';
import { readFileSync } from 'fs';
import { getCpuRate, getRamRate, getToken } from './common';
import { DEFAULT_PASSWORD, DEFAULT_USERNAME } from './const';

export const inject = ['server', 'file'];

export const config = Tsu.Object({
  username: Tsu.String().default(DEFAULT_USERNAME),
  password: Tsu.String().default(DEFAULT_PASSWORD)
});

export function main(ctx: Context, con: Tsu.infer<typeof config>) {
  const loadToken = () => ctx.file.load('token', 'txt');
  const updateToken = () => ctx.file.save('token', getToken(), 'txt');
  const checkToken = (token: string) => token && token === loadToken();

  const app = ctx.server;
  app.use(app.static(path.resolve(__dirname, '../dist')));
  app.use(app.json());

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  app.all('*', (req: any, res: any, next: any) => {
    if (req.path !== '/api/info') ctx.logger.label(req.method).trace(req.path);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Content-Type', 'application/json;charset=utf-8');
    if (req.path !== '/api/login' && !checkToken(String(req.query.token))) {
      res.status(200).json({});
      return;
    }
    next();
  });

  const router = app.router();

  router.get('/bots', (_, res) => {
    const bots: (Adapter['status'] & { platform: string; identity: string; id: string | number; lang: string })[] = [];
    ctx[Symbols.bot].forEach((bot) =>
      bot.forEach((api) =>
        bots.push({
          ...api.adapter.status,
          platform: api.adapter.platform,
          identity: api.adapter.identity,
          id: api.adapter.selfId,
          lang: api.adapter.config.lang
        })
      )
    );
    res.status(200).json(bots);
  });

  router.get('/modules', (_, res) => {
    const modules: [object, ModuleConfig][] = [];
    ctx[Symbols.modules].forEach((module) => modules.push([module[0].pkg, module[1]]));
    res.status(200).json(modules);
  });

  router.get('/data', (_, res) => {
    res.status(200).json({
      midwares: ctx[Symbols.midware].size,
      commands: ctx[Symbols.command].size,
      regexps: ctx[Symbols.regexp].size,
      bots: ctx[Symbols.bot].size,
      adapters: ctx[Symbols.adapter].size,
      modules: ctx[Symbols.modules].size,
      dir: ctx.baseDir.root,
      pkg: ctx.pkg,
      node: process.version
    });
  });

  router.get('/info', (_, res) => {
    res.status(200).json({
      cpu: getCpuRate(),
      ram: getRamRate(),
      version: JSON.parse(readFileSync(resolve(__dirname, '../package.json')).toString()).version
    });
  });

  router.get('/login', (req, res) => {
    const { user, pwd } = req.query;
    if (user === con.username && pwd === con.password) {
      updateToken();
      res
        .status(200)
        .json({ token: loadToken(), default: con.username === DEFAULT_USERNAME && con.password === DEFAULT_PASSWORD });
    } else {
      res.status(200).json({});
    }
  });

  router.get('/config', (req, res) => {
    const { type, id } = req.query;
    if (type === 'module') {
      if (typeof id === 'string') {
        const split = id.split('/');
        const handle = stringRightSplit(split.length > 1 ? split[1] : split[0], PLUGIN_PREFIX);
        res.status(200).json(handle in ctx.config.plugin ? ctx.config.plugin[handle] : {});
      } else {
        res.status(200).json({});
      }
    } else if (type === 'adapter') {
      res.status(200).json(typeof id === 'string' && id in ctx.config.adapter ? ctx.config.adapter[id] : {});
    } else {
      res.status(200).json(ctx.config);
    }
  });

  app.use('/api', router);
}
