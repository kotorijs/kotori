import stringify from 'fast-safe-stringify';
import dayjs from 'dayjs';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import Transport from '../utils/transport';
import { LoggerData, TransportOptionsBase } from '../types/common';

type FileTransportConfig = {
  filename?: 'default' | (() => string);
  time?: string;
  ext?: string;
  maxlen?: number;
  dir: string;
};

const DEFAULT_OPTIONS: Required<Omit<FileTransportConfig, 'dir'>> = {
  filename: 'default',
  time: 'YY-M-D',
  ext: '.log',
  maxlen: 500
};

export class FileTransport extends Transport<Required<FileTransportConfig>> {
  constructor(options: FileTransportConfig & TransportOptionsBase) {
    super({ ...DEFAULT_OPTIONS, ...options });
  }

  list = new Set();

  filename() {
    return dayjs().format(this.options.time);
  }

  handle(data: LoggerData) {
    const filename = this.options.filename instanceof Function ? this.options.filename() : this.filename();
    const dir = resolve(this.options.dir, `${filename}${this.options.ext}`);
    const d = data;
    d.msg = d.msg.length > this.options.maxlen ? `${d.msg.slice(0, this.options.maxlen)}...` : d.msg;
    const content = stringify(d);
    writeFileSync(dir, existsSync(dir) ? `${readFileSync(dir).toString()}\n${content}` : content);
  }
}

export default FileTransport;
