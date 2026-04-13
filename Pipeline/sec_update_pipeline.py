#!/home/ubuntu/portfolio/.venv/bin python3 
import json
import logging
import os
import sys
import sqlite3
import io
import zipfile
from datetime import date
import argparse

import requests
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from sec_models import SecRecord, Ticker, QuarterlyYearly
import sec_utils

parser = argparse.ArgumentParser()

parser.add_argument("--debug", action="store_true", help="Logger Debug Mode")

args = parser.parse_args()

LOG_FILE = 'sec_update_pipeline.log'
SUMMARY_FILE = 'sec_update_pipeline_summary.log'
ERROR_FILE = 'sec_update_errors.json'
DB_FILE = '../BackEnd/ginzu.db'
COMPANY_FACTS_URL = 'https://www.sec.gov/Archives/edgar/daily-index/xbrl/companyfacts.zip'
TICKER_FILE = '../common/ticker.txt'
TICKER_INDUSTRY_FILE = '../common/ticker_industry_map.json'

load_dotenv()

USER_AGENT = os.getenv('USER_AGENT')

logging.basicConfig(
    level=logging.DEBUG if args.debug else logging.INFO,
    format='%(asctime)s - %(levelname)s - %(funcName)s:%(lineno)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

cur_year = date.today().year

ticker_cik_map = {}
cik_ticker_map = {}

with open(TICKER_FILE, 'r') as f:
    for line in f:
        split = line.strip().split('\t')
        cik = split[1]
        ticker_cik_map[split[0]] = cik
        cik_ticker_map[cik] = split[0]

with open(TICKER_INDUSTRY_FILE, 'r') as f:
    ticker_ind_map = json.load(f)

"""
Transforms an arbitrary field that needs to fit into a QuarterYearly field.

Args:
    raw_data: json list of the field to be transformed.
    quarters_since_10k: int [0, 3], number of 10Q reports since last 10k report
    handle_ttm=False: boolean, if true, then this function will need to calculate
        the TTM data.  E.g. Revenue needs to add previous 4 quarters together.
        If false, only reports the most recent data for the quarterly result.
        E.g. Equity.

Returns:
    (year_val: float, quarter_val: float): returns the relevant yearly and
        quarterly values. If relevant data could not be found, returns 0,0.
"""
def quarterly_yearly_transform(raw_data, quarters_since_10k, handle_ttm=False):
    if raw_data == {}:
        return 0, 0

    records = []

    for entry in raw_data:
        try:
            record = SecRecord(**entry)
        except ValueError as e:
            continue
        except Exception as e:
            logging.error("Unable to parse entry: ", entry)
            logging.error("Error: ", e)
            continue

        if record.fy < cur_year - 2:
            continue

        records.append(
            record
        )

    records.sort(key= lambda e: e.end, reverse=True)

    year_records = []
    quarter_records = []

    for entry in records:
        if 'Q' in entry.frame:
            quarter_records.append(entry)
        else:
            year_records.append(entry)
    
    logging.debug("quarter_records:")
    logging.debug(quarter_records)
    logging.debug("year_records:")
    logging.debug(year_records)

    if handle_ttm:
        try:
            year_val, quarter_val = sec_utils.calculateTTM(
                year_records,
                quarter_records,
                quarters_since_10k
            )
        except IndexError as e:
            year_val, quarter_val = 0, 0
            logging.debug("Not enough data found, defaulting to zero")
    
    else:
        try:
            if quarters_since_10k == 0:
                quarter_val = quarter_records[0].val
                year_val = quarter_records[4].val
            else:
                quarter_val = quarter_records[0].val
                year_val = quarter_records[quarters_since_10k].val
        except IndexError as e:
            year_val, quarter_val = 0, 0
            logging.debug("Not enough data found, defaulting to zero")
    
    return year_val, quarter_val

"""
Extracts the most recent datapoint from a raw field.

Args:
    raw_data: JSON list to be extracted from

Returns:
    float: the most recent val from a valid entry.  If no valid entry can be found
        returns 0.
"""
def recent_transform(raw_data):
    if raw_data == {}:
        logger.debug("raw_data is empty, defaulting to zero")
        return 0

    records = []

    for entry in raw_data:
        try:
            record = SecRecord(**entry)
        except ValueError as e:
            continue
        except Exception as e:
            logging.error("Unable to parse entry: ", entry)
            logging.error("Error: ", e)
            continue

        if record.fy < cur_year - 2:
            continue

        records.append(
            record
        )

    records.sort(key= lambda e: e.end, reverse=True)

    if len(records) == 0:
        logging.debug("No valid records found")
        return 0

    return records[0].val

"""
Extracts the most recent n entries of yearly data.

Args:
    raw_data: JSON list of raw entries.
    years: number of years of data to be extracted.  If there are not enough
        entries available to extract, will return all that is available with
        a length less than years.

Returns:
    [float...]: a list of length at most years with the most recent yearly values
"""
def n_years_transform(raw_data, years):
    if raw_data == {}:
        logger.debug("raw_data is empty, defaulting to zero")
        return []

    records = []

    for entry in raw_data:
        try:
            record = SecRecord(**entry)
        except ValueError as e:
            continue
        except Exception as e:
            logging.error("Unable to parse entry: ", entry)
            logging.error("Error: ", e)
            continue

        if record.fy < cur_year - years - 1:
            continue

        records.append(
            record
        )

    records.sort(key= lambda e: e.end, reverse=True)

    year_records = []

    for entry in records:
        if 'Q' in entry.frame:
            continue
        else:
            year_records.append(entry)
    
    results = []

    for i in range(min(years, len(year_records))):
        results.append(year_records[i].val)

    return results

"""
Transform step of pipeline.

Args:
    raw_data: the parsed json object as it's received by the SEC

Returns:
    An instance of Ticker with all available fields added
"""
def transform(raw_data):
    name = raw_data['entityName']
    if type(raw_data['cik']) == str:
        cik = str(int(raw_data['cik']))
    else:
        cik = str(raw_data['cik'])
    ticker = cik_ticker_map[cik].upper()

    logger.info("Processing name: %s, cik: %s, ticker: %s", name, cik, ticker)

    quarters_since_10k = sec_utils.calc_quarters_since_10k(raw_data)

    logger.debug("quarters_since_10k: %s", quarters_since_10k)

    rev_try = [
        'RevenueFromContractWithCustomerExcludingAssessedTax',
        'Revenues',
        'RevenueFromContractWithCustomerIncludingAssessedTax'
    ]

    rev_year, rev_quarter = 0, 0

    for metric in rev_try:
        rev_year, rev_quarter = quarterly_yearly_transform(
            raw_data.get('facts', {}) \
                    .get('us-gaap', {}) \
                    .get(metric, {}) \
                    .get('units', {}) \
                    .get('USD', {}),
            quarters_since_10k,
            handle_ttm=True
        )

        if rev_year != 0 and rev_quarter != 0:
            break
    
    if rev_year == 0 or rev_quarter == 0:
        raise Exception("No Revenue found, cannot process")

    # final numbers should be in millions
    rev_year /= 1_000_000
    rev_quarter /= 1_000_000

    logger.debug('rev 10k: %s', rev_year)
    logger.debug('rev 10q: %s', rev_quarter)

    ebit_year, ebit_quarter = quarterly_yearly_transform(
        raw_data.get('facts', {}) \
                .get('us-gaap', {}) \
                .get('OperatingIncomeLoss', {}) \
                .get('units', {}) \
                .get('USD', {}),
        quarters_since_10k,
        handle_ttm=True
    )

    # final numbers should be in millions
    ebit_year /= 1_000_000
    ebit_quarter /= 1_000_000

    logger.debug('ebit 10k: %s', ebit_year)
    logger.debug('ebit 10q: %s', ebit_quarter)

    intexp_try = [
        'InterestExpense',
        'InterestExpenseNonoperating'
    ]

    intexp_year, intexp_quarter = 0, 0

    for metric in intexp_try:
        intexp_year, intexp_quarter = quarterly_yearly_transform(
            raw_data.get('facts', {}) \
                    .get('us-gaap', {}) \
                    .get(metric, {}) \
                    .get('units', {}) \
                    .get('USD', {}),
            quarters_since_10k,
            handle_ttm=True
        )

        if intexp_year != 0 and intexp_quarter != 0:
            break

    # final numbers should be in millions
    intexp_year /= 1_000_000
    intexp_quarter /= 1_000_000

    logger.debug('intexp 10k: %s', intexp_year)
    logger.debug('intexp 10q: %s', intexp_quarter)

    equity_year, equity_quarter = quarterly_yearly_transform(
        raw_data.get('facts', {}) \
                .get('us-gaap', {}) \
                .get('StockholdersEquity', {}) \
                .get('units', {}) \
                .get('USD', {}),
        quarters_since_10k
    )

    # final numbers should be in millions
    equity_year /= 1_000_000
    equity_quarter /= 1_000_000

    logger.debug("equity 10k: %s", equity_year)
    logger.debug("equity 10q: %s", equity_quarter)

    debt_paper_year, debt_paper_quarter = quarterly_yearly_transform(
        raw_data.get('facts', {}) \
                .get('us-gaap', {}) \
                .get('CommercialPaper', {}) \
                .get('units', {}) \
                .get('USD', {}),
        quarters_since_10k
    )

    debt_cur_year, debt_cur_quarter = quarterly_yearly_transform(
        raw_data.get('facts', {}) \
                .get('us-gaap', {}) \
                .get('LongTermDebt', {}) \
                .get('units', {}) \
                .get('USD', {}),
        quarters_since_10k
    )

    if debt_cur_year == 0 and debt_cur_quarter == 0:
        debt_cur_year, debt_cur_quarter = quarterly_yearly_transform(
            raw_data.get('facts', {}) \
                    .get('us-gaap', {}) \
                    .get('LongTermDebtFairValue', {}) \
                    .get('units', {}) \
                    .get('USD', {}),
            quarters_since_10k
        )

    debt_noncur_year = 0
    debt_noncur_quarter = 0

    if debt_cur_year == 0 and debt_cur_quarter == 0:
        debt_cur_year, debt_cur_quarter = quarterly_yearly_transform(
            raw_data.get('facts', {}) \
                    .get('us-gaap', {}) \
                    .get('LongTermDebtCurrent', {}) \
                    .get('units', {}) \
                    .get('USD', {}),
            quarters_since_10k
        )

        if debt_cur_year == 0 and debt_cur_quarter == 0:
            debt_cur_year, debt_cur_quarter = quarterly_yearly_transform(
                raw_data.get('facts', {}) \
                        .get('us-gaap', {}) \
                        .get('DebtCurrent', {}) \
                        .get('units', {}) \
                        .get('USD', {}),
                quarters_since_10k
            )

        debt_noncur_year, debt_noncur_quarter = quarterly_yearly_transform(
            raw_data.get('facts', {}) \
                    .get('us-gaap', {}) \
                    .get('LongTermDebtNoncurrent', {}) \
                    .get('units', {}) \
                    .get('USD', {}),
            quarters_since_10k
        )

    debt_lease_nc_year, debt_lease_nc_quarter = quarterly_yearly_transform(
        raw_data.get('facts', {}) \
                .get('us-gaap', {}) \
                .get('OperatingLeaseLiabilityNoncurrent', {}) \
                .get('units', {}) \
                .get('USD', {}),
        quarters_since_10k
    )

    debt_lease_year, debt_lease_quarter = quarterly_yearly_transform(
        raw_data.get('facts', {}) \
                .get('us-gaap', {}) \
                .get('OperatingLeaseLiabilityCurrent', {}) \
                .get('units', {}) \
                .get('USD', {}),
        quarters_since_10k
    )

    debt_year = debt_paper_year + debt_cur_year + debt_noncur_year \
                + debt_lease_year + debt_lease_nc_year
    debt_quarter = debt_paper_quarter + debt_cur_quarter + debt_noncur_quarter \
                   + debt_lease_quarter + debt_lease_nc_quarter

    # final numbers should be in millions
    debt_year /= 1_000_000
    debt_quarter /= 1_000_000

    logger.debug("debt 10k: %s", debt_year)
    logger.debug("debt 10q: %s", debt_quarter)

    cash_year, cash_quarter = quarterly_yearly_transform(
        raw_data.get('facts', {}) \
                .get('us-gaap', {}) \
                .get('CashAndCashEquivalentsAtCarryingValue', {}) \
                .get('units', {}) \
                .get('USD', {}),
        quarters_since_10k
    )

    if cash_year == 0 and cash_quarter == 0:
        cash_year, cash_quarter = quarterly_yearly_transform(
            raw_data.get('facts', {}) \
                    .get('us-gaap', {}) \
                    .get('CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents', {}) \
                    .get('units', {}) \
                    .get('USD', {}),
            quarters_since_10k
        )

    if cash_year == 0 and cash_quarter == 0:
        cash_year, cash_quarter = quarterly_yearly_transform(
            raw_data.get('facts', {}) \
                    .get('us-gaap', {}) \
                    .get('CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalentsIncludingDisposalGroupAndDiscontinuedOperations', {}) \
                    .get('units', {}) \
                    .get('USD', {}),
            quarters_since_10k
        )

    sec_cur_year, sec_cur_quarter = quarterly_yearly_transform(
        raw_data.get('facts', {}) \
                .get('us-gaap', {}) \
                .get('MarketableSecuritiesCurrent', {}) \
                .get('units', {}) \
                .get('USD', {}),
        quarters_since_10k
    )

    sec_noncur_year, sec_noncur_quarter = quarterly_yearly_transform(
        raw_data.get('facts', {}) \
                .get('us-gaap', {}) \
                .get('MarketableSecuritiesNoncurrent', {}) \
                .get('units', {}) \
                .get('USD', {}),
        quarters_since_10k
    )

    sec_inv_year, sec_inv_quarter = quarterly_yearly_transform(
        raw_data.get('facts', {}) \
                .get('us-gaap', {}) \
                .get('ShortTermInvestments', {}) \
                .get('units', {}) \
                .get('USD', {}),
        quarters_since_10k
    )

    cash_sec_year = cash_year + sec_cur_year + sec_noncur_year + sec_inv_year
    cash_sec_quarter = cash_quarter + sec_cur_quarter + sec_inv_quarter \
                       + sec_noncur_quarter

    # final numbers should be in millions
    cash_sec_year /= 1_000_000
    cash_sec_quarter /= 1_000_000

    logger.debug("cash & sec 10k: %s", cash_sec_year)
    logger.debug("cash & sec 10q: %s", cash_sec_quarter)

    minority_year, minority_quarter = quarterly_yearly_transform(
        raw_data.get('facts', {}) \
                .get('us-gaap', {}) \
                .get('MinorityInterest', {}) \
                .get('units', {}) \
                .get('USD', {}),
        quarters_since_10k
    )

    # final numbers should be in millions
    minority_year /= 1_000_000
    minority_quarter /= 1_000_000

    logger.debug("minority 10k: %s", minority_year)
    logger.debug("minority 10q: %s", minority_quarter)

    tax_rate = recent_transform(
        raw_data.get('facts', {}) \
                .get('us-gaap', {}) \
                .get('EffectiveIncomeTaxRateContinuingOperations', {}) \
                .get('units', {}) \
                .get('pure', {})
    )

    # final numbers are in percentage points
    tax_rate *= 100

    logger.debug("effective tax rate: %s", tax_rate)

    shares = recent_transform(
        raw_data.get('facts', {}) \
                .get('us-gaap', {}) \
                .get('WeightedAverageNumberOfDilutedSharesOutstanding', {}) \
                .get('units', {}) \
                .get('shares', {})
    )

    # final numbers should be in millions
    shares /= 1_000_000

    logger.debug("share count: %s", shares)

    nol = recent_transform(
        raw_data.get('facts', {}) \
                .get('us-gaap', {}) \
                .get('DeferredTaxAssetsOperatingLossCarryforwards', {}) \
                .get('units', {}) \
                .get('USD', {})
    )

    # final numbers should be in millions
    nol /= 1_000_000

    logger.debug("nol: %s", nol)

    rnd = n_years_transform(
        raw_data.get('facts', {}) \
                .get('us-gaap', {}) \
                .get('ResearchAndDevelopmentExpense', {}) \
                .get('units', {}) \
                .get('USD', {}),
        5
    )

    # final numbers should be in millions
    rnd = [e/1_000_000 for e in rnd]

    logger.debug("R&D: %s", rnd)

    ticker = Ticker(
        name=name,
        ticker=ticker,
        cik=cik,
        industry=ticker_ind_map.get(ticker, 'Choose an Industry'),
        years10k=quarters_since_10k/4.0,
        taxRateEffective=tax_rate,
        shares=shares,
        nol=nol,
        revenues=QuarterlyYearly(
            Q10=rev_quarter,
            K10=rev_year
        ),
        ebit=QuarterlyYearly(
            Q10=ebit_quarter,
            K10=ebit_year
        ),
        interestExpense=QuarterlyYearly(
            Q10=intexp_quarter,
            K10=intexp_year
        ),
        equity=QuarterlyYearly(
            Q10=equity_quarter,
            K10=equity_year
        ),
        debt=QuarterlyYearly(
            Q10=debt_quarter,
            K10=debt_year
        ),
        cash=QuarterlyYearly(
            Q10=cash_sec_quarter,
            K10=cash_sec_year
        ),
        nonOperatingAssets=QuarterlyYearly(
            Q10=0,
            K10=0
        ),
        minorityInterests=QuarterlyYearly(
            Q10=minority_quarter,
            K10=minority_year
        ),
        hasRdExpenses="Yes" if len(rnd) > 0 else "No",
        rdExpenses=rnd
    )

    logger.debug(ticker.model_dump_json(indent=2))

    return ticker

"""
Load step of pipeline.  Loads a Ticker instance into the sqlite db.

Args:
    ticker: an instance of the Ticker class
    cursor: an instance of the sqlite cursor object

Returns:
    None.  Executes the insert command onto the cursor instance.  The cursor
    instance will need to handle the eventual commit.
"""
def load(ticker, cursor):
    # Insert a row of data
    cursor.execute(
        """
            INSERT INTO tickers 
            (cik, ticker, data_jsonb)
            VALUES (?, ?, ?)
            ON CONFLICT(cik) DO UPDATE SET
            ticker = excluded.ticker,
            data_jsonb = excluded.data_jsonb;
        """,
        (
            int(ticker.cik),
            ticker.ticker,
            ticker.model_dump_json()
        )
    )

"""
ETL Pipeline to process full sec data daily and update sqlite db with latest financial info.

Pipeline will
    EXTRACT:
        - Download the full sec zip from 
            https://www.sec.gov/Archives/edgar/daily-index/xbrl/companyfacts.zip
        - Unzip each company json file one by one into memory for processing
    TRANSFORM
        - Process specific fields of interest from the json object
        - Process each entry of the field into an SecRecord object
        - Aggregate the extracted data into the required company data
        - Dump this data into a Ticker object
    LOAD
        - Load these Ticker objects into SQLite db
"""
def main():
    try:
        # SEC is freely available, requires a User-Agent header to declare who
        # is accessing the data
        cf_response = requests.get(
            COMPANY_FACTS_URL,
            headers={
                'User-Agent': USER_AGENT,
                'Accept-Encoding': 'gzip, deflate',
                'Host': 'www.sec.gov'
            }
        )

        cf_response.raise_for_status()

        cf_zip_bytes = cf_response.content

        with (
            zipfile.ZipFile(io.BytesIO(cf_zip_bytes)) as zf,
            sqlite3.connect(DB_FILE) as connection
        ):
            connection.execute("PRAGMA journal_mode=WAL")
            connection.execute("PRAGMA synchronous=NORMAL")

            cursor = connection.cursor()

            errors = {}
            successes = 0

            for name in zf.namelist():
                zf_cik = name.split('.')[0]
                if str(int(zf_cik[3:])) in cik_ticker_map:
                    logger.debug("processing %s", name)

                    with zf.open(name) as f:
                        raw = json.load(f)
                        try:
                            ticker = transform(raw)
                            successes += 1
                        except Exception as e:
                            logger.error('Error with transform step - cik: %s', zf_cik)
                            logger.error('Transform step error: %s', e)
                            errors[zf_cik] = str(e)
                        try:
                            load(ticker, cursor)
                        except Exception as e:
                            logger.error('Error with load step - cik: %s', zf_cik)
                            logger.error('Load step error: %s', e)
                        if successes % 100 == 0:
                            try:
                                logger.info("Batch committed to sqlite")
                                connection.commit()
                            except Exception as e:
                                logger.error('Error during commit')
                                connection.rollback()
                                raise

    except Exception as e:
        logger.error('Error trying to download company facts zip')
        logger.error(e)
    
    logger.info("Successes: %s", successes)
    logger.info("Errors: %s", len(errors))

    with open(ERROR_FILE, 'w') as f:
        json.dump(errors, f)
        logger.info("Errors saved to %s", ERROR_FILE)

    # TODO: append to a special log file that reports success and error count
    with open(SUMMARY_FILE, 'a') as f:
        f.write(f"Date: {date.today().strftime("%Y-%m-%d")}\n")
        f.write(f"Successes: {successes}\n")
        f.write(f"Errors: {len(errors)}\n")
    
if __name__ == "__main__":
    main()