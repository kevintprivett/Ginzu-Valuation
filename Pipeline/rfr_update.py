#!/home/ubuntu/portfolio/.venv/bin python3 
import json
import logging
import os
import sys
import sqlite3

import requests
from bs4 import BeautifulSoup
from pydantic import BaseModel, Field

LOG_FILE = 'rfr_update.log'

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler(sys.stdout)
    ]
)

class RfrModel(BaseModel):
    rate: float = Field(ge=0.0, le=20.0)

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
        for col in reversed(cols):
            if col.get_text(strip=True) == '':
                continue
            rfr_model = RfrModel(rate=float(col.get_text(strip=True)))
            break
        break
    except Exception as e:
        print(f"Invalid rfr value")
        raise e

rfr = rfr_model.rate

if rfr <= 0:
    raise ValueError(f'Extracted rfr {rfr} is out of expected bounds.')

logging.info(f'extracted rfr {rfr}')

# with --sqlite, try to load to sqlite db
if "--sqlite" in sys.argv[1:]:
    try:
        # Use a context manager to handle connection and transactions
        with sqlite3.connect('../BackEnd/ginzu.db') as connection:
            cursor = connection.cursor()

            # Insert a row of data
            cursor.execute(
                """
                    INSERT INTO risk_free_rates (rate)
                    VALUES (?)
                """,
                (rfr,)
            )

            # Save (commit) the changes
            connection.commit()
            
    except Exception as e:
        print(f"Error updating ginzu.db: {e}")
        raise(e)

else:
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