import winston from 'winston';

const ERROR_LOG = process.env.ERROR_LOG;
const COMBINED_LOG = process.env.COMBINED_LOG;

if (!ERROR_LOG) {
  throw new Error("ERROR_LOG env variable is required");
}

if (!COMBINED_LOG) {
  throw new Error("COMBINED_LOG env variable is required");
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.splat(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.File({ filename: ERROR_LOG, level: 'error' }),
    new winston.transports.File({ filename: COMBINED_LOG })
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console())
}

export default logger;
