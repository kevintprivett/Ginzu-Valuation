#!/home/ubuntu/portfolio/.venv/bin python3 
import json
import logging
import os

import requests
from bs4 import BeautifulSoup

LOG_FILE = 'rfr_update.log'

logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

rfr_url = "https://www.federalreserve.gov/releases/h15/"

try:
    response = requests.get(rfr_url)
    response.raise_for_status()
    rfr_soup = BeautifulSoup(response.text, 'html.parser')

    all_tables = rfr_soup.find_all('table')

    rfr_table = next(table for table in all_tables if '10-year' in str(table))
    if not rfr_table:
        raise ValueError("Could not find the interest rate table in the HTML content.")

except Exception as e:
    logging.error(f"Error fetching rfr data: {e}")
    raise(e)

rfr_rows = rfr_table.find_all('tr')[1:]
rfr = 0

for row in rfr_rows:
    if "10-year" not in row.get_text():
        continue

    cols = row.find_all('td')
    try:
        rfr = float(cols[-1].get_text(strip=True))
        break
    except Exception as e:
        print(f"Invalid rfr value")
        raise e

if rfr <= 0:
    raise ValueError(f'Extracted rfr {rfr} is out of expected bounds.')

logging.info(f'extracted rfr {rfr}')

# adjust market data json
try:
    logging.debug('opening marketData.json for update')
    with open('../FrontEnd/src/utils/marketData.json', 'r') as f:
        market_data = json.load(f)

    if market_data['rfr'] == rfr:
        logging.info('rfr in marketData.json is already up to date. No changes made.')
        exit(0)

    market_data['rfr'] = rfr

    logging.debug('writing updated marketData.json')
    with open('../FrontEnd/src/utils/marketData.json', 'w') as f:
        json.dump(market_data, f, indent=2)

    logging.info("marketData.json updated successfully.")

except Exception as e:
    print(f"Error updating marketData.json: {e}")
    raise(e)