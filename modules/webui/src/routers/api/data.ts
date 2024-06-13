import os from 'node:os';
import { Adapter, Symbols, loadConfig } from 'kotori-bot';
import { resolve } from 'node:path';
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

const AVATAR_COLOR_LIST = [
  ['#64FFDA', '#00B0FF', '#FFFFFF'], // default
  ['#FFD700', '#FF8C00', '#000000'], // gold
  ['#EF9A9A', '#F44336', '#FFFFFF'], // red
  ['#03A9F4', '#0D47A1', '#212121'], // blue
  ['#A5D6A7', '#4CAF50', '#FFFFFF'], // green
  ['#CE93D8', '#9C27B0', '#FFFFFF'], // purple
  ['#BCAAA4', '#795548', '#FFFFFF'], // shit
  ['#FFC0CB', '#FF69B4', '#FFFFFF'], // pink
  ['#78909C', '#546E7A', '#FFFFFF'] // grey
];

export default (ctx: Context, app: Context['server']) => {
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

  router.get('/avatar/:scope?/:name?', (req, res) => {
    const DEFAULT_NAME = 'Kotori Plugin';
    const DEFAULT_COLOR = AVATAR_COLOR_LIST[0];
    const DEFAULT_FONT_SIZE = 75;

    /* Handle plugin name */
    const { scope, name } = req.params;
    let pluginName = DEFAULT_NAME;
    if (scope) {
      pluginName = name ?? scope;
      if (pluginName.startsWith('kotori-plugin-')) pluginName = pluginName.slice(14);
      pluginName = pluginName
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    /* Get index of avatar color based on plugin name */
    const hash = pluginName.split('').reduce((hash, char) => hash * 31 + char.charCodeAt(0), 0);
    const index = hash % 9;
    const color = AVATAR_COLOR_LIST[index >= 0 ? index : index + 9];

    /* Complete font size */
    const fontSize = Math.ceil(108 * (9 / pluginName.length));

    /* Load avatar image and replace data */
    let imageData = loadConfig(resolve(__dirname, './avatar.svg'), 'text');
    imageData = imageData.replace(DEFAULT_COLOR[0], color[0]);
    imageData = imageData.replace(DEFAULT_COLOR[1], color[1]);
    imageData = imageData.replace(DEFAULT_COLOR[2], color[2]);
    imageData = imageData.replace(DEFAULT_NAME, pluginName);
    imageData = imageData.replace(DEFAULT_FONT_SIZE.toString(), fontSize.toString());

    /* Send image data */
    res.type('image/svg+xml').send(imageData);
  });

  return router;
};
