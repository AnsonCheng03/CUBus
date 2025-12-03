export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
const order: LogLevel[] = ['debug', 'info', 'warn', 'error'];

let current: LogLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info';
export function setLogLevel(l: LogLevel) {
  current = l;
}
function on(l: LogLevel) {
  return order.indexOf(l) >= order.indexOf(current);
}

export const log = {
  debug: (...a: unknown[]) => on('debug') && console.debug('[debug]', ...a),
  info: (...a: unknown[]) => on('info') && console.info('[info]', ...a),
  warn: (...a: unknown[]) => on('warn') && console.warn('[warn]', ...a),
  error: (...a: unknown[]) => on('error') && console.error('[error]', ...a),
};
