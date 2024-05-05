import { PLUGIN_PREFIX, stringRightSplit } from 'kotori-bot';
import { Context } from '../../types';

/* eslint-disable-next-line func-names */
export default function (ctx: Context, app: Context['server']) {
  const getPluginConfig = () =>
    Object.entries(ctx.config.plugin).map(([name, origin]) => ({ name, origin, schema: {} }));
  const getBotConfig = () => Object.entries(ctx.config.adapter).map(([id, origin]) => ({ id, origin, schema: {} }));
  const router = app.router();

  router.get('/plugins/:scope?/:name?', (req, res) => {
    const { scope, name } = req.params;
    if (!scope) return res.json(getPluginConfig());

    const pluginName = stringRightSplit(name ?? scope, PLUGIN_PREFIX);
    const pluginConfig = getPluginConfig().find((plugin) => plugin.name === pluginName);
    return pluginConfig ? res.json(pluginConfig) : res.status(404).json({ message: 'Plugin not found' });
  });

  router.put('/plugins/:scope?/:name?', (req, res) => {
    const { scope, name } = req.params;
    const { body } = req;
    if (!scope || !name) return res.status(400).json({ message: 'Invalid plugin scope' });
    if (typeof body !== 'object') return res.status(400).json({ message: 'Invalid body' });

    const pluginName = stringRightSplit(name ?? scope, PLUGIN_PREFIX);
    const pluginConfig = getPluginConfig().find((plugin) => plugin.name === pluginName);
    if (!pluginConfig) return res.status(404).json({ message: 'Plugin not found' });

    Object.keys(body).forEach((key) => {
      if (key in pluginConfig) pluginConfig[key as keyof typeof pluginConfig] = body[key];
    });
    return res.status(204).send();
  });

  router.get('/bots/:name?', (req, res) => {
    const { name } = req.params;
    if (!name) return res.json(getBotConfig());

    const botConfig = getBotConfig().find((bot) => bot.id === name);
    return botConfig ? res.json(botConfig) : res.status(404).json({ message: 'Bot not found' });
  });

  router.put('/bots/:name?', (req, res) => {
    const { name } = req.params;
    const { body } = req;
    if (!name) return res.status(400).json({ message: 'Invalid bot name' });
    if (typeof body !== 'object') return res.status(400).json({ message: 'Invalid body' });

    const botConfig = ctx.config.adapter[name];
    if (!botConfig) return res.status(404).json({ message: 'Bot not found' });

    Object.keys(body).forEach((key) => {
      if (key in botConfig) botConfig[key as keyof typeof botConfig] = body[key];
    });
    return res.status(204).send();
  });

  router.get('/global', (_, res) => {
    res.json(ctx.config.global);
  });

  router.put('/global', (req, res) => {
    const { body } = req;
    if (typeof body !== 'object') return res.status(400).json({ message: 'Invalid body' });

    Object.keys(body).forEach((key) => {
      if (key in ctx.config.global) ctx.config.global[key as 'lang'] = body[key];
    });
    return res.status(204).send();
  });

  return router;
}
