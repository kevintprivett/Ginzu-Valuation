#!/home/ubuntu/portfolio/.venv/bin python3 
import json
import logging
import os

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()

LOG_FILE = os.getenv('ERP_LOG')

logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

erp_url = "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/home.htm"

try:
    response = requests.get(erp_url)
    response.raise_for_status()
    erp_soup = BeautifulSoup(response.text, 'html.parser')
except Exception as e:
    logging.error(f"Error fetching erp data: {e}")
    raise(e)

for p_tag in erp_soup.find_all('p'):
    if "Implied ERP on" in p_tag.get_text():
        implied_erp_p = p_tag

implied_erp_split = implied_erp_p.get_text(strip=True).split('=')

logging.info(f'ERP valid date: {implied_erp_split[0].strip()}')

after_equals = implied_erp_split[1].strip()
target_erp_segment = after_equals.split(';')[0].strip()
target_erp = float(target_erp_segment.split('%')[0].strip())

if target_erp <= 0 or target_erp > 10:
    logging.error(f'Extracted erp {target_erp} is out of expected bounds.')
    raise ValueError(f'Extracted erp {target_erp} is out of expected bounds.')

logging.info(f'extracted erp {target_erp}')

# adjust market data json
try:
    logging.debug('opening marketData.json for update')
    with open('../FrontEnd/src/utils/marketData.json', 'r') as f:
        market_data = json.load(f)

    if market_data['countries']['United States']['ERP'] == target_erp:
        logging.info('erp in marketData.json is already up to date. No changes made.')
        exit(0)

    market_data['countries']['United States']['ERP'] = target_erp

    logging.debug('writing updated marketData.json')
    with open('../FrontEnd/src/utils/marketData.json', 'w') as f:
        json.dump(market_data, f, indent=2)

    logging.info("marketData.json updated successfully.")

except Exception as e:
    print(f"Error updating marketData.json: {e}")
    raise(e)