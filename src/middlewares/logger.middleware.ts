import morgan from 'morgan';
import { createLogger, format, transports } from 'winston';

const { combine, timestamp, json, colorize, printf, errors } = format;

const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const logContent = stack || message;
  const metaData = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  
  return `${level}: ${timestamp} ${logContent}${metaData}`;
});

export const logger = createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  transports: [
    new transports.Console({
      format: combine(colorize(), consoleFormat),
    }),
  ],
});

export const requestLogger = morgan(
  (tokens, req, res) => {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number(tokens.status(req, res)),
      responseTime: Number(tokens['response-time'](req, res)),
    });
  },
  {
    stream: {
      write: (message) => {
        const data = JSON.parse(message);
        logger.info(``,data);
      },
    },
  }
);