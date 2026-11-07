import { createLogger, format, transports } from 'winston'

const { combine, timestamp, colorize, printf } = format

const devFormat = printf(({ level, message, timestamp: ts, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
  return `${ts} [${level}] ${message}${metaStr}`
})

export const logger = createLogger({
  level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
  format: combine(timestamp({ format: 'HH:mm:ss' }), colorize(), devFormat),
  transports: [new transports.Console()],
})
