import { Context } from 'kotori-bot';
import { generateMessage } from '../utils/common';

export default function main(ctx: Context, server: Exclude<ReturnType<Context['server']['wss']>, undefined>) {
  server.on('connection', (ws) => {
    const interval = ctx.webui.config.interval * 1000;
    const timer = setInterval(() => {
      if (ws.readyState === ws.CLOSED || ws.readyState === ws.CLOSING) {
        clearInterval(timer);
        return;
      }
      ws.send(generateMessage('stats', ctx.webui.getStats()));
    }, interval);
  });
}
