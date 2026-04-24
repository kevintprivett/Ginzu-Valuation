import fs from 'node:fs/promises';

import logger from '../services/LoggerService.js';

/**
 * Loads the ticker map from local file and returns it as an object.
 * @returns {string: number} an object mapping ticker strings to cik ids as ints
 */
export async function loadTickerMap() {
  const tickerMap = {};
  const file = await fs.open('../common/ticker.txt', 'r');

  try {
    for await (const line of file.readLines({ encoding: 'utf8' })) {
      if (!line) {
        continue;
      }

      let splitLine = line.split('\t');
      tickerMap[splitLine[0].trim()] = parseInt(splitLine[1].trim(), 10);
    }

    return tickerMap;
  } catch (err) {
    logger.error('Error reading ticker file: %s', err);
    throw err;
  } finally {
    await file.close();
  }
}
