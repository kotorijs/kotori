import stringify from 'fast-safe-stringify';
import { createColors } from 'colorette';
import dayjs from 'dayjs';
import { LoggerData } from '../types/internal';
import Transport from '../utils/transport';
import { escaperSingle } from '../utils/escaper';
import { LoggerLevel, TransportOptionsBase } from '../types/common';

type Level = Exclude<keyof typeof LoggerLevel, 'SILENT'>;
type Color = keyof ReturnType<typeof createColors>;

type ConsoleTransportConfig = {
  template?: string | ConsoleTransport['render'];
  label?: string;
  labelColor?: Color;
  time?: string;
  timeColor?: Color;
  pidColor?: Color;
  useColor?: boolean;
  detail?: {
    [K in Level]?: [string, Color?, Color?];
  };
  indent?: number;
};

const DEFAULT_OPTIONS: Required<ConsoleTransportConfig> = {
  template: '%time% %type% (%pid%) %label%: %msg%',
  label: '[%name%]',
  labelColor: 'cyan',
  time: 'YY/M/D H:m:s', // Reference: https://day.js.org/docs/en/display/format
  timeColor: 'blue',
  pidColor: 'bold',
  useColor: true,
  detail: {
    FATAL: ['FATAL', 'redBright', 'redBright'],
    ERROR: ['ERROR', 'red', 'red'],
    WARN: ['WARN', 'yellowBright', 'yellowBright'],
    INFO: ['INFO', 'green'],
    DEBUG: ['DEBUG', 'magenta', 'magentaBright'],
    TRACE: ['TRACE', 'gray', 'gray']
  },
  indent: 2
};

function format(template: string, args: Record<string, string>) {
  let str = template;
  Object.keys(args).forEach((key) => {
    str = str.replaceAll(`%${key}%`, args[key]);
  });
  return str;
}

export class ConsoleTransport extends Transport<ConsoleTransportConfig> {
  private c: ReturnType<typeof createColors>;

  render(data: LoggerData) {
    const { options, c } = this;
    const handle = (content: string, color: Color | undefined) => (color ? c[color](content) : content);
    const time = handle(
      dayjs().format(options.time ?? DEFAULT_OPTIONS.time),
      options.timeColor ?? DEFAULT_OPTIONS.timeColor
    );
    const pid = handle(String(data.pid), options.pidColor ?? DEFAULT_OPTIONS.pidColor);
    const label = handle(
      data.label.map((name) => format(options.label ?? DEFAULT_OPTIONS.label, { name })).join(' '),
      options.labelColor ?? DEFAULT_OPTIONS.labelColor
    );
    const detail = (options.detail ?? DEFAULT_OPTIONS.detail)[LoggerLevel[data.level] as Level];
    const type = detail && detail[1] ? c[detail[1]](LoggerLevel[data.level]) : LoggerLevel[data.level];
    const msg = detail && detail[2] ? c[detail[2]](data.msg) : data.msg;
    return format((options.template ?? DEFAULT_OPTIONS.template) as string, { time, type, pid, label, msg });
  }

  constructor(options?: ConsoleTransportConfig & TransportOptionsBase) {
    super(options ?? DEFAULT_OPTIONS);
    this.c = createColors({ useColor: !!this.options.useColor });
  }

  escaper = (args: unknown[]) => {
    const result = args
      .map((arg) => {
        if (arg && typeof arg === 'object') {
          const result = stringify(arg, undefined, this.options.indent ?? DEFAULT_OPTIONS.indent);
          if (result === '{}') return String(arg);
          return result;
        }
        return escaperSingle(arg);
      })
      .join(' ');
    return result
      .replace(/([0-9]+)/g, this.c.yellow('$1'))
      .replaceAll('undefined', this.c.dim('undefined'))
      .replaceAll('null', this.c.bold('null'))
      .replace('true', this.c.yellow('true'))
      .replaceAll('false', this.c.yellow('false'));
  };

  handle(data: LoggerData) {
    const result = typeof this.options.template === 'function' ? this.options.template(data) : this.render(data);
    if (data.level === LoggerLevel.FATAL || data.level === LoggerLevel.ERROR) {
      process.stderr.write(`${result}\n`);
      return;
    }
    process.stdout.write(`${result}\n`);
  }
}

export default ConsoleTransport;
