import '../types';
import { CommandAccess, Context, MessageScope, formatFactory } from 'kotori-bot';

export default (ctx: Context) => {
  ctx.on('status', ({ status, adapter }) => {
    if (status !== 'online') return;
    if (adapter.platform !== 'cmd') return;
    if (ctx.webui.getVerifySalt()) return;
    adapter.api.sendPrivateMsg(
      formatFactory(adapter.ctx.i18n)('当前未设置 Webui 账号与密码，请输入 {0}webui 指令以进行初始化', [
        adapter.config['command-prefix']
      ]),
      adapter.config.master
    );
  });

  ctx
    .command('webui - 查看 Webui 状态')
    .scope(MessageScope.PRIVATE)
    .access(CommandAccess.ADMIN)
    .option('R', 'reset:boolean - 重置 Webui 账户数据')
    .action(async ({ options: { reset } }, session) => {
      if (reset) {
        ctx.file.save('salt', '');
        return 'Webui 账户数据已重置。';
      }
      if (session.api.adapter.platform !== 'cmd') return 'Webui 指令仅支持在控制台环境下使用。';
      if (!ctx.webui.getVerifySalt()) {
        ctx.webui.setVerifyHash(await session.prompt('请输入用户名：'), await session.prompt('请输入密码：'));
        return '配置成功！请再次输入指令以查看运行状态';
      }
      return ['Webui 服务已启动！运行端口：{0}', [ctx.config.global.port]];
    });
};
