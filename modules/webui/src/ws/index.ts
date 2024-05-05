import '../types';
import { Context } from 'kotori-bot';
import { generateMessage } from '../utils/common';

export default function main(ctx: Context, server: Exclude<ReturnType<Context['server']['wss']>, undefined>) {
  server.on('connection', (ws) => {
    // if (!ctx.webui.checkToken(req.headers.authorization)) ws.close(1008, 'Invalid token');

    /* Setup interval to send stats to client */
    const interval = ctx.webui.config.interval * 1000;
    const timer = setInterval(() => {
      if (ws.readyState === ws.CLOSED || ws.readyState === ws.CLOSING) {
        clearInterval(timer);
        return;
      }
      ws.send(generateMessage('stats', ctx.webui.getStats()));
    }, interval);
    ctx.on('dispose', () => clearInterval(timer));

    /* Listen for messages from client */
    ws.on('message', (message) => {
      let data;
      try {
        data = JSON.parse(message.toString());
      } catch {
        return;
      }
      switch (data.action) {
        case 'command':
          if (!data.command) {
            ws.send(generateMessage('error', 'No command provided.'));
            break;
          }
          process.stdin.emit('data', data.command);
          ctx.logger.label('server').trace(`Received command from client: ${data.command}`);
          break;
        default:
      }
    });

    /* Listen for console output from server */
    ctx.on('console_output', (data) => ws.send(generateMessage('console_output', data)));
  });
}
