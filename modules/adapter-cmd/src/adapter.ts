/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:09
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-02-14 19:51:35
 */
import { Adapter, AdapterConfig, Context, MessageScope, Tsu, eventDataTargetIdSchema } from 'kotori-bot';
import CmdApi from './api';
import CmdElements from './elements';

export const config = Tsu.Object({
  nickname: Tsu.String().default('Kotarou'),
  age: Tsu.Number().min(0).default(18),
  sex: Tsu.Union([Tsu.Literal('male'), Tsu.Literal('female')]),
  'self-nickname': Tsu.String().default('KotoriO'),
  'self-id': eventDataTargetIdSchema.default('720')
});

type CmdConfig = Tsu.infer<typeof config> & AdapterConfig;

export class CmdAdapter extends Adapter<CmdApi> {
  private messageId = 1;

  public readonly config: CmdConfig;

  public constructor(ctx: Context, config: CmdConfig, identity: string) {
    super(ctx, config, identity, CmdApi, new CmdElements());
    this.config = config;
    this.selfId = config['self-id'];
    process.stdin.on('data', (data) => this.handle(data));
  }

  public handle(data: Buffer) {
    if (this.status.value !== 'online') return;
    let message = data.toString();
    if (message === '\n' || message === '\r\n') return;
    message = message.replace('\r\n', '').replace('\n', '');
    this.session('on_message', {
      type: MessageScope.PRIVATE,
      messageId: this.messageId,
      message,
      userId: this.config.master,
      sender: {
        nickname: this.config.nickname,
        sex: this.config.sex,
        age: this.config.age
      }
    });
    this.messageId += 1;
  }

  public start() {
    this.ctx.emit('connect', {
      type: 'connect',
      adapter: this,
      normal: true,
      mode: 'other',
      address: 'command line'
    });
    this.online();
  }

  public stop() {
    this.ctx.emit('connect', {
      type: 'disconnect',
      adapter: this,
      normal: true,
      mode: 'other',
      address: 'command line'
    });
    this.offline();
  }

  public send(action: string, params?: object) {
    if (this.status.value !== 'online' || action !== 'send_private_msg' || !params) return;
    if (typeof (params as { message: string }).message !== 'string') return;
    if ((params as { user_id: unknown }).user_id !== this.config.master) return;
    process.stdout.write(`${this.config['self-nickname']} > ${(params as { message: string }).message} \r\n`);
    this.messageId += 1;
    this.ctx.emit('send', {
      api: this.api,
      messageId: this.messageId
    });
  }
}

export default CmdAdapter;
