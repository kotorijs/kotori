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

  router.get('/bots/:name?', (req, res) => {
    const { name } = req.params;
    if (!name) return res.json(getBotConfig());

    const botConfig = getBotConfig().find((bot) => bot.id === name);
    return botConfig ? res.json(botConfig) : res.status(404).json({ message: 'Bot not found' });
  });

  router.get('/global', (_, res) => {
    res.json(ctx.config.global);
  });

  return router;
}
