import express from 'express';

import { getRfr } from './services/DatabaseService.js';
import logger from './services/LoggerService.js';

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/rfr', (req, res) => {
  res.send(getRfr());
});

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
