import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.splat(),
    winston.format.simple()
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
