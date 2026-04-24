## Back-End Spec Doc

### Features:
- change rfr to be served by this backend (I think erp is fine as a monthly PR)
    - Change rfr to be updated daily instead of weekly
- data pipeline from SEC
    - Create a process for bulk import (first time and any emergency retry)
    - Create a process for daily import
- Incorporate mappings between ticker symbols and damodaran industry info as well as mappings to sec IDs (should be static)
- Local SQLite DB
    - Due to small scall, can just use SQLite for now
    - I'm envisioning something closer to a document database, as the basic flow will be get ticker symbol (or SEC ID) and serve all the relevant data for that company, or the pipeline updating the data for each company.  There's no real data relationships.
    - Automated off-server backups

### Front-End
- Add simple button on Company Info to fetch financial data
- Explore how hard it will be to match a ticker to an SEC ID consistently, may need to a popup to further specify the correct option
- This mapping should be static data so it's not hitting the backend to check for a match

### Back-End
- Express, JS
- endpoints:
    - rfr
        - Should try to cache this, no reason to hit my db very often for this as it changes daily
    - ticker/[ticker]
        - Returns a json of all the relevant financial data to be added to the frontend
- services:
    - sqlite adapter, sqlite3 should be fine for the scope of this project
- how to handle auth? I don't want endpoints to be spammable but I don't want users to have to sign in
    - opus recommends rate limiting, cloudflare, CORS & origin validation, short-lived tokens
- no real validation needed, maybe keep an in-memory map of available tickers to verify it's a proper option before hitting db

### Database
- Need to review anything special for sqlite schema
- dates are integers (unix time)
- Maybe add an index on ticker?
- tables
    - tickers
        - cik (pk, int), ticker (str), data_jsonb (blob), created_on (int - unix), updated_on (int - unix)
    - rfr
        - rate (real), created_on (int - unix ; order by)

### Pipelines
- I think that simple cron jobs with python scripts are appropriate
- There are a few recommended systems that LLMs recommended that seem like good additions:
    - pydantic for data validation
    - tenacity for automatic retry logic
    - health checks using something like Healthchecks.io
    - depending on size of data, polars or pandas for the transform steps

### SEC Links
- IMPORTANT: breakdown of the sec us-gaap taxonomy (field names) and how often they are used
    - https://xbrl.fasb.org/resources/annualrelease/2026/GAAP_Taxonomy.zip
- https://www.sec.gov/search-filings/edgar-application-programming-interfaces
- ticker to CIK mapping: https://www.sec.gov/include/ticker.txt
- I'm not sure what the schema is, but here are some attributes that could be useful:
    - ['facts']['dei'] -> EntityCommonStockSharesOutstanding
    - ['facts']['us-gaap'] -> OperatingIncomeLoss, MinorityInterest, DebtLongtermAndShorttermCombinedAmount, Revenues, InterestExpense, StockholdersEquity, CashAndCashEquivalentsAtCarryingValue, DeferredTaxAssetsOperatingLossCarryforwards, EffectiveIncomeTaxRateContinuingOperations, ShareBasedCompensationArrangementByShareBasedPaymentAwardOptionsOutstandingNumber, ShareBasedCompensationArrangementByShareBasedPaymentAwardOptionsOutstandingWeightedAverageExercisePrice, ResearchAndDevelopmentExpense
    - missing average maturity of debt, non-operating assets (might be on other companies, only tested XYL), option maturity in years
    - possible search terms that can help: us-gaap:ScheduleOfMaturitiesOfLongTermDebtTableTextBlock, us-gaap:SharebasedCompensationArrangementBySharebasedPaymentAwardOptionsVestedAndExpectedToVestOutstandingWeightedAverageRemainingContractualTerm1, us-gaap:DisclosureOfCompensationRelatedCostsShareBasedPaymentsTextBlock
- sample endpoints for google
    - https://data.sec.gov/api/xbrl/companyfacts/CIK0001652044.json
    - https://data.sec.gov/api/xbrl/companyconcept/CIK0001652044/us-gaap/OperatingIncomeLoss.json
        - Provides full history of a specific entry
    - https://data.sec.gov/submissions/CIK0001652044.json
        - full submission history (no data)
- https://www.sec.gov/Archives/edgar/daily-index/xbrl/companyfacts.zip
    - Provides a full dump of all data, recompiled nightly
    - about 1.3 GB
- It looks like there isn't a clear "daily summary" it may be better to just do a daily pull of the company facts data overnight.
    - I can try to query each tickers "submissions" endpoint for new submissions
    - I can watch the latest filings rss feed
        - https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&CIK=&type=&company=&dateb=&owner=include&start=0&count=40&output=atom
    - honestly, 1.3 GB of data doesn't seem like that much...

### Sprints:
- ~~Sprint - Scaffolding:~~
    - ~~Create scaffolding for backend, db, rfr pipeline~~
    - ~~Deploy rfr pipeline to run daily and add to db~~
    - ~~Deploy backend and db to serve just the rfr~~
- ~~Sprint - SEC Pipeline:~~
    - ~~Develop and deploy the SEC pipeline to dump to db~~
    - ~~Do testing on multiple companies, seems like I'll need to have a lot of keywords saved to find the exact number I need~~
- ~~Sprint - Backend:~~
    - ~~Develop and deploy the full backend~~
    - ~~Create and deploy a docker image~~
- Sprint - Frontend:
    - Develop interface in frontend for making requests to this new backend for this data
- Sprint - CI/CD:
    - Figure out how to deploy all of this on main push
