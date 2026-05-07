import logging

from sec_models import SecRecord

logger = logging.getLogger(__name__)

"""
Convience function to calculate ttm given a list of yearly records, a list of
quarterly records, and the number of years since 10Q.

Args:
    year_record: list of SecRecords mapping to yearly data
    quarter_record: list of SecRecords mapping to quarterly data

Returns:
    (year, quarter): the last record from 10k and the TTM of quarterly

NB: if quarters_since_10k is 0, then the "year" will be the previous year and
"quarter" will be the most recent 10K data
"""
def calculateTTM(year_record, quarter_record, quarters_since_10k):
    if quarters_since_10k == 0:
        year = year_record[1].val
        quarter = year_record[0].val
    elif quarters_since_10k == 1:
        if len(quarter_record) < 4:
            raise IndexError(
                "Quarter Record too short to calculate TTM"
            )
        year = year_record[0].val
        quarter = year_record[0].val + quarter_record[0].val \
                        - quarter_record[3].val
    elif quarters_since_10k == 2:
        if len(quarter_record) < 5:
            raise IndexError(
                "Quarter Record too short to calculate TTM"
            )
        year = year_record[0].val
        quarter = year_record[0].val + quarter_record[0].val \
                        + quarter_record[1].val - quarter_record[3].val \
                        - quarter_record[4].val
    else:
        if len(quarter_record) < 6:
            raise IndexError(
                "Quarter Record too short to calculate TTM"
            )
        year = year_record[0].val
        quarter = year_record[0].val + quarter_record[0].val \
                        + quarter_record[1].val + quarter_record[2].val \
                        - quarter_record[3].val - quarter_record[4].val \
                        - quarter_record[5].val
    
    return year, quarter

"""
Convience function to calculate the number of quarters since the last 10k was filed.

Args:
    data: full company json from sec

Returns:
    int: [0,3] number of quarters since last 10k
"""
def calc_quarters_since_10k(data):
    try:
        net_income = data['facts']['us-gaap']['NetIncomeLoss']['units']['USD']
    except Exception as e:
        logger.error("quarters_since_10k: Error accessing net income data")
        raise e

    records = []

    for entry in net_income:
        # logging.info(entry)

        try:
            record = SecRecord(**entry)
        except ValueError as e:
            continue
        except Exception as e:
            logging.error("Unable to parse entry: ", entry)
            logging.error("Error: ", e)
            continue

        records.append(
            record
        )

    records.sort(key= lambda e: e.end, reverse=True)

    logger.debug(records)

    result = 0

    for record in records:
        if 'Q' in record.form:
            result += 1
            continue
        break

    return result