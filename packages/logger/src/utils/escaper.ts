import stringify from 'fast-safe-stringify';

export function escaperSingle(arg: unknown) {
  if (typeof arg === 'string') return arg;
  if (arg && typeof arg === 'object') {
    const result = stringify(arg);
    if (result === '{}') return String(arg);
    return result;
  }
  if (typeof arg === 'function') {
    return `[${arg.toString().slice(0, 5) === 'class' ? 'class' : 'Function'} ${arg.name || '(anonymous)'}]`;
  }
  return String(arg);
}

export function escaper(args: unknown[]) {
  return args.map((arg) => escaperSingle(arg)).join(' ');
}
