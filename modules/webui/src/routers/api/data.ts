import os from 'node:os';
import { Adapter, Symbols } from 'kotori-bot';
import { Context } from '../../types';
import { calcGrandRecord } from '../../utils/common';

interface ModulePackage {
  name: string;
}

interface BotData {
  status: Adapter['status'];
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
    const botsStatus = getBotData().map((bot) => bot.status.value === 'online');
    const msgTotal = calcGrandRecord(ctx.webui.getMsgTotal().origin);
    const { success: loginSuccess, failed: loginFailed } = ctx.webui.getLoginStats();
    const chats: Record<'received' | 'sent', number[]> = { received: [], sent: [] };
    [0, 1, 2, 3, 4, 5, 6, 7].forEach((day) => {
      const { received, sent } = calcGrandRecord(ctx.webui.getMsgDay(day).origin);
      chats.received.push(received || 0);
      chats.sent.push(sent || 0);
    });

    res.json({
      chats,
      count: {
        midwares: ctx[Symbols.midware].size,
        commands: ctx[Symbols.command].size,
        regexps: ctx[Symbols.regexp].size,
        bots: ctx[Symbols.bot].size,
        adapters: ctx[Symbols.adapter].size,
        modules: ctx[Symbols.modules].size
      },
      system: {
        type: os.type(),
        arch: os.arch(),
        uptime: os.uptime(),
        hostname: os.hostname(),
        homedir: os.homedir(),
        node: process.version
      },
      info: {
        message: `${msgTotal.received}:${msgTotal.sent}`,
        bots: `${botsStatus.filter((status) => status).length}/${botsStatus.length}`,
        login: `${loginSuccess}:${loginFailed}`,
        memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
      }
    });
  });

  router.get('/status', (_, res) => {
    res.json({
      ...ctx.webui.getStats(),
      mode: ctx.options.mode,
      core: ctx.pkg.version
    });
  });

  return router;
}
