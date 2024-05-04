import os from 'os';
import { Symbols } from 'kotori-bot';
import { Context } from '../../types';

interface ModulePackage {
  name: string;
}

interface BotData {
  status: object;
  platform: string;
  identity: string;
  id: string;
  lang: string;
}

/* eslint-disable-next-line func-names */
export default function (ctx: Context, app: Context['server']) {
  const getModuleData = () => {
    const list: ModulePackage[] = [];
    ctx[Symbols.modules].forEach((module) => list.push(module[0].pkg));
    return list;
  };

  const getBotData = () => {
    const list: BotData[] = [];
    ctx[Symbols.bot].forEach((bot) =>
      bot.forEach((api) =>
        list.push({
          status: api.adapter.status,
          platform: api.adapter.platform,
          identity: api.adapter.identity,
          id: String(api.adapter.selfId),
          lang: api.adapter.config.lang
        })
      )
    );
    return list;
  };

  const router = app.router();

  router.get('/modules/:scope?/:name?', (req, res) => {
    const { scope, name } = req.params;
    if (!scope) return res.json(getModuleData());

    const moduleName = name ? `${scope}/${name}` : scope;
    const moduleData = getModuleData().find((module) => module.name === moduleName);
    return moduleData ? res.json(moduleData) : res.status(404).json({ message: 'Modules not found' });
  });

  router.get('/bots/:name', (req, res) => {
    const { name } = req.params;
    if (!name) return res.json(getBotData());

    const botData = getBotData().find((bot) => bot.identity === name);
    return botData ? res.json(botData) : res.status(404).json({ message: 'Bot not found' });
  });

  router.get('/stats', async (_, res) => {
    res.json({
      chats: {
        received: [0, 0, 0, 0, 0, 0, 0],
        sent: [0, 0, 0, 0, 0, 0, 0]
      },
      count: {
        midwares: ctx[Symbols.midware].size,
        commands: ctx[Symbols.command].size,
        regexps: ctx[Symbols.regexp].size,
        bots: ctx[Symbols.bot].size,
        adapters: ctx[Symbols.adapter].size,
        modules: ctx[Symbols.modules].size
      },
      env: {
        dirs: ctx.baseDir,
        options: ctx.options
      },
      version: {
        node: process.version,
        core: ctx.pkg.version
      },
      system: {
        type: os.type(),
        platform: os.platform(),
        arch: os.arch(),
        uptime: os.uptime(),
        hostname: os.hostname(),
        homedir: os.homedir()
      },
      status: ctx.webui.getStats()
    });
  });

  return router;
}
