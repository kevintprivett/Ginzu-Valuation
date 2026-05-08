import cdf from '@stdlib/stats-base-dists-normal-cdf';
import {
  CocApproaches,
  BetaApproaches,
  CodCompanyTypes,
  CodApproaches,
  ErpApproaches,
} from './Enums';
import marketData from './marketData';
import { rfrApi } from '../services/apiService';

/*
 * NOTE:
 * All numbers are in millions, except for percentages.
 * Percentages will be handled as displayed, as if a ratio * 100 (10% would
 * stored as 10)
 */

/*
 * Calculates the weight of a particular entry of an array compared to the
 * sum of the rest of the array.  Can handle a specific property of an array
 * of objects using the property argument
 *
 * Accepts index (number) to indicate the index of the element of interest
 * Accepts array (array) as the array to be tested
 * Accepts optionally property (string) of the property name to be tested
 *
 * Returns the ratio (number) of the value of the index over the sum of the
 * array
 */
export const calculateWeight = (index, array, property = null) => {
  let thisWeight = 0;
  let totalWeight = 0;
  if (property === null) {
    thisWeight = array[index];
    totalWeight = array.reduce((acc, cur) => acc + cur, 0);
  } else {
    thisWeight = array[index][property];
    totalWeight = array.reduce((acc, cur) => acc + cur[property], 0);
  }

  if (totalWeight === 0) {
    return 0;
  }
  return thisWeight / totalWeight;
};

/*
 * Calculates cost of capital of provided company, accounting for the specific
 * approach requested.
 *
 * Accepts as input the full company object (object). Operates primarily on the
 * selected cocApproach which defines the approach used for this calculation,
 * cocDirect which is the direct input cost of capital, businesses, which is
 * the breakdown of all business segments with the specific industry and
 * revenue of each business. The company object is provided to additional
 * helper functions to determine the value of equity, value of debt, value of
 * preferred shares, cost of equity, cost of debt, and cost of preferred.
 *
 * Returns the cost of capital (number) as if with a percentage sign (12.34%
 * is 12.34)
 *
 * The direct selection accepts the cost of capital provided to it.
 * The average selection uses the businesses information to calculate an average
 * cost of capital using revenues and industry average EV/Sales to estimate an
 * enterprise value of each segment then using the industry average cost of
 * capital.
 * The detailed approach attempts to value equity, debt, and preferred shares,
 * as well as to determine the cost of each component to arrive at a total
 * cost of capital.
 */
export const calculateCostOfCapital = (company) => {
  const approach = company.cocApproach;
  const direct = company.cocDirect;
  const businesses = company.businesses;

  if (approach === CocApproaches.DIRECT) {
    return direct;
  }

  if (approach === CocApproaches.AVERAGE) {
    // sum(cost of capital * EV) / total EV
    const cocxEv = businesses.reduce((acc, cur) => {
      const coc = marketData.industries[cur.business]['Cost of Capital'];
      const ev = marketData.industries[cur.business]['EV/Sales'] * cur.revenue;
      return acc + coc * ev;
    }, 0);

    const totalEv = businesses.reduce(
      (acc, cur) =>
        acc + marketData.industries[cur.business]['EV/Sales'] * cur.revenue,
      0
    );

    if (totalEv === 0) {
      return 0;
    }
    return cocxEv / totalEv;
  }

  const equityValue = calculateValueOfEquity(company);
  const debtValue = calculateValueOfDebt(company);
  const preferredValue = calculateValueOfPreferred(company);
  const totalCapital = equityValue + debtValue + preferredValue;

  const coe = calculateCostOfEquity(company);
  const cod = calculateCostOfDebt(company);
  const cop = calculateCostOfPreferred(company);

  const coc =
    (equityValue / totalCapital) * coe +
    (debtValue / totalCapital) * cod +
    (preferredValue / totalCapital) * cop;

  if (!Number.isFinite(coc)) {
    return 0;
  }

  return coc;
};

/*
 * Calculates the long term cost of capital.
 *
 * Accepts company object as input
 *
 * Returns cost of capital (number) as if with a percentage symbol (12.34% as 12.34)
 */
export const calculateCostOfCapitalLong = (company) => {
  const cocOverride = company.overrides.cocLong;
  const rfrLong = calculateRiskFreeRateLong(company);
  return cocOverride ? company.cocLong : rfrLong + 4.5;
};

/*
 * Calculates the cost of equity for the company.
 *
 * Takes as input the company object (object). Passes this object to helper
 * functions in order to calculate the leveredBeta and erp for the company.
 * Uses the risk-free rate from marketData.
 *
 * Returns cost of equity (number) as if with a percentage symbol (12.34% as 12.34)
 */
export const calculateCostOfEquity = (company) => {
  const rfr = calculateRiskFreeRateLong(company);
  const leveredBeta = calculateLeveredBeta(company);
  const erp = calculateErp(company);

  return rfr + leveredBeta * erp;
};

/*
 * Calculates post-tax cost of debt for the company, based on the selected
 * approach.
 *
 * Accepts as input the company object (object), accesses taxRateMarginal in
 * order to arrive at a post-tax cost of debt. Passes the company object to a
 * helper function to calculate the synthetic rating and the pre-tax cost of
 * debt.
 *
 * Provides the cost of debt (number) as if with a percentage symbol (12.34% as
 * 12.34)
 */
export const calculateCostOfDebt = (company) => {
  const taxRate = company.taxRateMarginal / 100;
  const preTaxCod = calculatePreTaxCostOfDebt(company) / 100;

  return preTaxCod * (1 - taxRate) * 100;
};

/*
 * Calculates pre-tax cost of debt for the company, based on the selected
 * approach.
 *
 * Accepts as input the company object (object). Primarily uses the codApproach
 * property, an enum that determines the specific approach to be used,
 * codDirect as the provided pre-tax cost of debt, as a number provided in
 * front of a percentage symbol, and debtRating as an enum determining the actual
 * credit rating of the company's debt. Passes the company object to a helper
 * function to calculate the synthetic rating.
 *
 * Provides the cost of debt (number) as if with a percentage symbol (12.34% as
 * 12.34)
 */
const calculatePreTaxCostOfDebt = (company) => {
  const codApproach = company.codApproach;
  const codDirect = company.codDirect / 100;
  const debtRating = company.debtRating;
  const rfr = calculateRiskFreeRateLong(company) / 100;

  if (codApproach === CodApproaches.DIRECT) {
    return codDirect * 100;
  }

  if (codApproach === CodApproaches.SYNTHETIC) {
    const synthRating = calculateSyntheticRating(company);

    return (rfr + marketData.credit_ratings[synthRating]['Spread'] / 100) * 100;
  }

  return (rfr + marketData.credit_ratings[debtRating]['Spread'] / 100) * 100;
};

/*
 * Calculates the cost of preferred shares.
 *
 * Accepts as input the company object (object). Primarily uses the price
 * and dividend of the preferred shares.
 *
 * returns the cost of preferred shares (number) as if with a percentage symbol
 * (12.34% as 12.34)
 */
export const calculateCostOfPreferred = (company) => {
  const result = (company.preferredDividend / company.preferredPrice) * 100;

  if (!Number.isFinite(result)) {
    return 0;
  }

  return result;
};

/*
 * Calculates the market value of the company's debt using the book debt,
 * interest expense, calculated cost of debt, and average maturity.
 *
 * Accepts as input the company object (object), using interestExpense,
 * averageMaturity of the debt, and bookDebt. Company is passed to a helper
 * function to calculate cost of debt.
 *
 * Returns the value of debt (number) in millions.
 */
export const calculateValueOfDebt = (company) => {
  const interestExpense = company.interestExpense['Q10'];
  const averageMaturity = company.debtMaturity;
  const bookDebt = company.debt['Q10'];
  const cod = calculatePreTaxCostOfDebt(company) / 100;

  const result =
    (interestExpense * (1 - (1 + cod) ** -averageMaturity)) / cod +
    bookDebt / (1 + cod) ** averageMaturity;

  if (isNaN(result)) {
    return 0;
  }

  return result;
};

/*
 * Calculates the value of equity.
 *
 * Accepts as input the company object (object), using the stockPrice and
 * shares.
 *
 * Returns the value of equity (number) in millions.
 */
export const calculateValueOfEquity = (company) => {
  return company.stockPrice * company.shares;
};

/*
 * Calculates the value of preferred shares.
 *
 * Accepts as input the company object (object), using the preferredShares
 * count and preferredPrice.
 *
 * Returns the value of preferred shares (number) in millions.
 */
export const calculateValueOfPreferred = (company) => {
  return company.preferredShares * company.preferredPrice;
};

/*
 * Calculates the unlevered beta for the company based on the selected approach.
 *
 * Accepts as input the company object (object). Uses the betaApproach to determine
 * if a direct input, single industry beta, or a weighted average of business betas
 * (based on estimated enterprise value) should be used.
 *
 * Returns the unlevered beta (number).
 */
export const calculateUnleveredBeta = (company) => {
  const approach = company.betaApproach;
  const direct = company.betaDirect;
  const industry = company.industry;
  const businesses = company.businesses;

  if (approach === BetaApproaches.DIRECT) {
    return direct;
  }

  if (approach === BetaApproaches.SINGLE) {
    return marketData.industries[industry]['Beta'];
  }

  const betaxEv = businesses.reduce((acc, cur) => {
    const beta = marketData.industries[cur.business]['Beta'];
    const ev = marketData.industries[cur.business]['EV/Sales'] * cur.revenue;
    return acc + beta * ev;
  }, 0);

  const totalEv = businesses.reduce(
    (acc, cur) =>
      acc + marketData.industries[cur.business]['EV/Sales'] * cur.revenue,
    0
  );

  if (totalEv === 0) {
    return 0;
  }

  return betaxEv / totalEv;
};

/*
 * Calculates the levered beta for the company based on the selected approach.
 *
 * Accepts as input the company object (object), using betaApproach to determine
 * the approach, betaDirect as the leveredBeta, taxRateMarginal to account for
 * tax effects on debt. The company object is passed to helper funcitons to
 * calculate unlevered beta, value of debt, and value of equity
 *
 * Returns the levered beta (number).
 */
const calculateLeveredBeta = (company) => {
  const approach = company.betaApproach;
  const direct = company.betaDirect;

  if (approach === BetaApproaches.DIRECT) {
    return direct;
  }

  const unleveredBeta = calculateUnleveredBeta(company);
  const taxRate = company.taxRateMarginal / 100;
  const valueOfDebt = calculateValueOfDebt(company);
  const valueOfEquity = calculateValueOfEquity(company);

  const result =
    unleveredBeta * (1 + (1 - taxRate) * (valueOfDebt / valueOfEquity));

  if (!Number.isFinite(result)) {
    return 0;
  }

  return result;
};

/*
 * Calculates the Equity Risk Premium (ERP) for the company based on the
 * selected approach.
 *
 * Accepts as input the company object (object). Uses the erpApproach to determine
 * if a direct input, a single country's ERP, a revenue-weighted average of
 * multiple countries' ERPs, or a revenue-weighted average of multiple
 * regions' ERPs should be used.
 *
 * Returns the Equity Risk Premium (number) as if with a percentage symbol
 * (12.34% as 12.34).
 */
export const calculateErp = (company) => {
  const erpApproach = company.erpApproach;
  const erpDirect = company.erpDirect;
  const countries = company.countries;
  const regions = company.regions;

  if (erpApproach === ErpApproaches.DIRECT) {
    return erpDirect;
  }

  if (erpApproach === ErpApproaches.COUNTRY) {
    return marketData.countries['United States']['ERP'];
  }

  if (erpApproach === ErpApproaches.COUNTRIES) {
    const totalRevenue = countries.reduce((acc, cur) => acc + cur.revenue, 0);

    const result = countries.reduce(
      (acc, cur) =>
        acc +
        (cur.revenue / totalRevenue) * marketData.countries[cur.country]['ERP'],
      0
    );

    if (!Number.isFinite(result)) {
      return 0;
    }

    return result;
  }

  const totalRevenue = regions.reduce((acc, cur) => acc + cur.revenue, 0);

  const result = regions.reduce(
    (acc, cur) =>
      acc +
      (cur.revenue / totalRevenue) * marketData.regions[cur.region]['ERP'],
    0
  );

  if (isNaN(result)) {
    return 0;
  }

  return result;
};

/*
 * Calculates the synthetic credit rating for the company based on its
 * interest coverage ratio and company type (safe or risky).
 *
 * Accepts as input the company object (object), using the definied
 * codCompanyType to determine safe or risky. The company object is passed to
 * helper functions to calculate interest coverage.
 *
 * Returns the synthetic rating (string).
 */
export const calculateSyntheticRating = (company) => {
  const interestCoverage = calculateInterestCoverage(company);

  let suffix = '';
  if (company.codCompanyType === CodCompanyTypes.SAFE) {
    suffix = 'safe';
  } else if (company.codCompanyType === CodCompanyTypes.RISKY) {
    suffix = 'risk';
  }

  for (const rating of Object.keys(marketData.credit_ratings)) {
    const gt = marketData.credit_ratings[rating][`gt_${suffix}`];
    const lt = marketData.credit_ratings[rating][`lt_${suffix}`];

    if (interestCoverage > gt && interestCoverage <= lt) {
      return rating;
    }
  }

  return 'ERR';
};

/*
 * Calculates the interest coverage ratio (EBIT / Interest Expense) for the
 * company.
 *
 * Accepts as input the company object (object), using the current ebit and
 * interestExpense.
 *
 * Returns the interest coverage ratio (number). Returns a large number (100000)
 * if interest expense is zero, and a large negative number (-100000) if EBIT is
 * negative.
 */
const calculateInterestCoverage = (company) => {
  const ebit = company.ebit['Q10'];
  const interestExpense = company.interestExpense['Q10'];

  if (interestExpense === 0) {
    return 100000;
  }
  if (ebit < 0) {
    return -100000;
  }

  return ebit / interestExpense;
};

/*
 * Calculates the base revenue growth rate using the most recent TTM revenue
 * and the prior period revenue (from 10K).
 *
 * Accepts as input the company object (object), using the TTM revenue, the most
 * recent 10K revenue, and years10k.
 *
 * Returns the revenue growth rate (number) as percentage (12.34% as 12.34)
 */
export const calculateRevenueGrowthRate = (company) => {
  const revenueTtm = company.revenues['Q10'];
  const revenue10k = company.revenues['K10'];
  const years10k = company.years10k;

  const result = ((revenueTtm / revenue10k - 1) / years10k) * 100;

  return Number.isFinite(result) ? result : 0;
};

/*
 * Calculates the long term revenue growth rate.
 *
 * Accepts as input the company object (object), using the revenueGrowth
 * override flag, the revenueGrowth.long value.
 *
 * Returns the long term revenue growth rate (number) as a percentage (12.34%
 * as 12.34)
 */
export const calculateLongRevenueGrowthRate = (company) => {
  const rfr = calculateRiskFreeRateLong(company);
  return company.overrides.revenueGrowth ? company.revenueGrowth.long : rfr;
};

/*
 * Calculates the operating margin (EBIT/Revenue). Adjusts EBIT for R&D
 * capitalization effect if the company has R&D expenses.
 *
 * Accepts as input the company object (object), using the most recent ebit,
 * revenue, and rdExpenses. Passes the company object to a helper function to
 * calculate the effect that R&D spending has on ebit.
 *
 * Returns the operating margin (number) as a percentage (12.34% as 12.34).
 */
export const calculateOperatingMargin = (company) => {
  const ebit = company.ebit['Q10'];
  const revenue = company.revenues['Q10'];
  const hasRdExpenses = company.hasRdExpenses;

  const adjustedEbit = hasRdExpenses
    ? ebit + calculateEbitRdEffect(company)
    : ebit;

  const result = (adjustedEbit / revenue) * 100;

  if (!Number.isFinite(result)) {
    return 0;
  }

  return result;
};

/*
 * Calculates the Sales to Capital Ratio (Revenue / Invested Capital).
 *
 * Accepts as input the company object (object), using the most recent revenue.
 * The company object is passed to a helper function to calculate invested
 * capital amount.
 *
 * Returns the Sales to Capital Ratio (number).
 */
export const calculateSalesCapRatio = (company) => {
  const revenue = company.revenues['Q10'];
  const investedCapital = calculateInvestedCapital(company);

  const result = revenue / investedCapital;

  return Number.isFinite(result) ? result : 0;
};

/*
 * Calculates the Invested Capital (Equity + Debt - Cash + R&D Capitalization,
 * if applicable).
 *
 * Accepts as input the company object (object), utilizing the most recent
 * equity, debt, cash, and rdExpenses.
 *
 * Returns the Invested Capital (number) in millions.
 */
export const calculateInvestedCapital = (company) => {
  // equity + debt - cash + R&D capitalization
  const equity = company.equity.Q10;
  const debt = company.debt.Q10;
  const cash = company.cash.Q10;

  const hasRdExpenses = company.hasRdExpenses;

  if (hasRdExpenses) {
    const capitalizedRd = calculateRdCapitalization(company);

    return equity + debt - cash + capitalizedRd;
  }

  return equity + debt - cash;
};

/*
 * Calculates the Return on Capital (ROC) after tax.
 *
 * Accepts as input the company object (object), utilizing the most recent ebit
 * and the current effective tax rate. The company object is passed to a helper
 * function that calculates invested capital.
 *
 * Returns the Return on Capital (number) as a ratio.
 */
export const calculateReturnOnCapital = (company) => {
  const ebit = company.ebit.Q10;
  const tax = company.taxRateEffective / 100;

  const investedCapital = calculateInvestedCapital(company);

  const result = ((ebit * (1 - tax)) / investedCapital) * 100;

  return Number.isFinite(result) ? result : 0;
};

/*
 * Calculates the long term return of capital.
 *
 * Accepts company object as input
 *
 * Returns return of capital (number) as if with a percentage symbol (12.34% as 12.34)
 */
export const calculateReturnOnCapitalLong = (company) => {
  const rocOverride = company.overrides.rocLong;
  const rfrLong = calculateRiskFreeRateLong(company);
  return rocOverride ? company.rocLong : rfrLong + 4.5;
};

/*
 * Calculates the capitalized R&D expenditure amount using a straight-line
 * amortization model over the length of the provided R&D expense history.
 *
 * Accepts as input the company object (object), utilizing rdExpenses.
 *
 * Returns the capitalized R&D (number) in millions.
 */
const calculateRdCapitalization = (company) => {
  const rdExpenses = company.rdExpenses;
  const numYears = rdExpenses.length - 1;

  let result = 0;

  for (let i = 1; i < rdExpenses.length; ++i) {
    result += rdExpenses[i] * (1 - i / numYears);
  }

  return result;
};

/*
 * Calculates the effect of R&D capitalization on EBIT
 *
 * Accepts as input the company object (object), utilizing the rdExpenses.
 * The company object is passed along to a helper function to calculate R&D
 * capitalization.
 *
 * Returns the R&D adjustment to EBIT (number) in millions.
 */
const calculateEbitRdEffect = (company) => {
  const rdExpenses = company.rdExpenses;
  const rdCapitalization = calculateRdCapitalization(company);

  if (rdExpenses.length === 0) {
    return 0;
  }

  return rdExpenses[0] - rdCapitalization;
};

/*
 * Calculates the long term risk free rate.
 *
 * Accepts company object as input
 *
 * Returns risk free rate (number) as if with a percentage symbol (12.34% as 12.34)
 */
export const calculateRiskFreeRateLong = (company) => {
  const rfrOverride = company.overrides.rfrLong;
  const { data: rfr } = rfrApi.endpoints.getRfr.useQuery();
  return rfrOverride ? company.rfrLong : rfr;
};

/*
 * Projects the revenue growth rate over the next 10 years.
 *
 * Accepts as input the company object (object), utilizing revenueGrowth.
 * Long term rev growth is assumed to match the risk free rate unless
 * overriden by the revenueGrowth override.
 *
 * Returns an array (number[]) of projected annual revenue growth rates (as a
 * percentage, 10.5% as 10.5).
 */
export const projectRevenueGrowthRate = (company) => {
  const baseRevGrowth = calculateRevenueGrowthRate(company);
  const nextRevGrowth = company.revenueGrowth.next;
  const midRevGrowth = company.revenueGrowth.mid;
  const longRevGrowth = calculateLongRevenueGrowthRate(company);

  return [
    baseRevGrowth,
    nextRevGrowth,
    midRevGrowth,
    midRevGrowth,
    midRevGrowth,
    midRevGrowth,
    midRevGrowth - (midRevGrowth - longRevGrowth) / 5,
    midRevGrowth - ((midRevGrowth - longRevGrowth) / 5) * 2,
    midRevGrowth - ((midRevGrowth - longRevGrowth) / 5) * 3,
    midRevGrowth - ((midRevGrowth - longRevGrowth) / 5) * 4,
    longRevGrowth,
    longRevGrowth,
  ];
};

/*
 * Projects the annual revenue over the next 10 years.
 *
 * Accepts as input the company object (object), of which the current revenue
 * is used, and the projectedRevenueGrowthRate (number[]).
 *
 * Returns an array (number[]) of projected annual revenues (in millions).
 */
export const projectRevenue = (company, projectedRevenueGrowthRate) => {
  const baseRevenue = company.revenues['Q10'];

  const result = [baseRevenue];

  for (let i = 1; i < projectedRevenueGrowthRate.length; ++i) {
    result.push(result[i - 1] * (1 + projectedRevenueGrowthRate[i] / 100));
  }

  return result;
};

/*
 * Projects the operating margin (EBIT/Revenue) over the next 10 years.
 *
 * Accepts as input the company object (object).
 *
 * Returns an array (number[]) of projected operating margins (as if with
 * a percentage sign, 12.34% is 12.34).
 */
export const projectOperatingMargin = (company) => {
  const baseEbitMargin = calculateOperatingMargin(company);
  const nextEbitMargin = company.operatingMargin.next;
  const midEbitMargin = company.operatingMargin.mid;
  const longEbitMargin = company.operatingMargin.long;

  return [
    baseEbitMargin,
    nextEbitMargin,
    midEbitMargin,
    midEbitMargin,
    midEbitMargin,
    midEbitMargin,
    midEbitMargin - (midEbitMargin - longEbitMargin) / 5,
    midEbitMargin - ((midEbitMargin - longEbitMargin) / 5) * 2,
    midEbitMargin - ((midEbitMargin - longEbitMargin) / 5) * 3,
    midEbitMargin - ((midEbitMargin - longEbitMargin) / 5) * 4,
    longEbitMargin,
    longEbitMargin,
  ];
};

/*
 * Projects the annual EBIT over the next 10 years.
 *
 * Accepts as input the company object (object), with the most recent ebit
 * being used, the projectedRevenue (number[]), and the
 * projectedOperatingMargin (number[]).
 *
 * Returns an array (number[]) of projected annual EBIT (in millions).
 */
export const projectEbit = (
  company,
  projectedRevenue,
  projectedOperatingMargin
) => {
  const baseEbit = company.ebit['Q10'];

  const result = [baseEbit];

  for (let i = 1; i < projectedRevenue.length; ++i) {
    result.push((projectedRevenue[i] * projectedOperatingMargin[i]) / 100);
  }

  return result;
};

/*
 * Projects the effective tax rate over the next 10 years.
 *
 * Accepts as input the company object (object), and uses the taxRateEffective,
 * as well as the taxRateEffectiveLong override to determine if taxRateLong
 * should be used or if the prevailing marginal tax rate should be used.
 *
 * Returns an array (number[]) of projected effective tax rates (as a
 * percentage, e.g., 25.0).
 */
export const projectTaxRate = (company) => {
  const taxRateEffective = company.taxRateEffective;
  const taxRateOverride = company.overrides.taxRateEffectiveLong;
  const taxRateLong = taxRateOverride
    ? company.taxRateEffectiveLong
    : marketData.taxRate;

  return [
    taxRateEffective,
    taxRateEffective,
    taxRateEffective,
    taxRateEffective,
    taxRateEffective,
    taxRateEffective,
    taxRateEffective + (taxRateLong - taxRateEffective) / 5,
    taxRateEffective + ((taxRateLong - taxRateEffective) / 5) * 2,
    taxRateEffective + ((taxRateLong - taxRateEffective) / 5) * 3,
    taxRateEffective + ((taxRateLong - taxRateEffective) / 5) * 4,
    taxRateLong,
    taxRateLong,
  ];
};

/*
 * Projects the annual tax expense, accounting for Net Operating Losses (NOL).
 *
 * Accepts projectedEbit (number[]), projectedTaxRate (number[]),
 * and projectedNol (number[]) as input arrays.
 *
 * Returns an array (number[]) of projected annual tax expenses (in millions).
 */
export const projectTaxExpense = (
  projectedEbit,
  projectedTaxRate,
  projectedNol
) => {
  const result = [];

  // Tax rate is a percentage
  const firstTaxExpense = (projectedEbit[0] * projectedTaxRate[0]) / 100;
  result.push(firstTaxExpense > 0 ? firstTaxExpense : 0);

  for (let i = 1; i < projectedEbit.length; ++i) {
    const nol = projectedNol[i - 1];
    const taxExpense =
      nol > projectedEbit[i]
        ? 0
        : ((projectedEbit[i] - nol) * projectedTaxRate[i]) / 100;

    result.push(taxExpense > 0 ? taxExpense : 0);
  }

  return result;
};

/*
 * Projects the annual Reinvestment Expense over the next 10 years.
 *
 * Accepts the company object (object), in order to determine the override
 * selections for cocLong and rfrLong. Also accepts projectedRevenueGrowthRate
 * (number[]),  projectedRevenue (number[]), projectedEbit (number[]), and
 * projectedTaxExpense (number[]) as input.
 *
 * Returns an array (number[]) of projected annual reinvestment expenses (in
 * millions).
 */
export const projectReinvestmentExpense = (
  company,
  projectedRevenueGrowthRate,
  projectedRevenue,
  projectedEbit,
  projectedTaxExpense
) => {
  const projectedSalesCap = projectSalesCap(company);
  const rocLong = calculateReturnOnCapitalLong(company);

  const result = [NaN];

  for (let i = 1; i < projectedRevenue.length - 1; ++i) {
    let entry =
      (projectedRevenue[i + 1] - projectedRevenue[i]) / projectedSalesCap[i];
    result.push(Number.isFinite(entry) ? entry : 0);
  }

  result.push(
    (projectedRevenueGrowthRate.at(-1) / 100 / (rocLong / 100)) *
      (projectedEbit.at(-1) - projectedTaxExpense.at(-1))
  );

  return result;
};

/*
 * Projects the annual Invested Capital over the next 10 years.
 *
 * Accepts the company object (object), and accesses rdExpenses, equity, debt,
 * cash.  The company object is passed to a helper function that calculates the
 * rdCapitalization.  Also acceptsprojectedReinvestmentExpense (number[]).
 *
 * Returns an array (number[]) of projected annual invested capital (in millions).
 */
export const projectInvestedCapital = (
  company,
  projectedReinvestmentExpense
) => {
  const baseIc = calculateInvestedCapital(company);

  const result = [baseIc];

  for (let i = 1; i < projectedReinvestmentExpense.length - 1; ++i) {
    result.push(result[i - 1] + projectedReinvestmentExpense[i]);
  }

  result.push(NaN);

  return result;
};

/*
 * Projects the annual Return on Invested Capital (ROIC) over the next 10 years.
 *
 * Accepts the company object (object), and accesses the overrides and long term
 * projections for risk free rate and cost of capital. Also accepts
 * projectedInvestedCapital (number[]), projectedEbit (number[]), and
 * projectedTaxExpenses (number[]) as input.
 *
 * Returns an array (number[]) of projected annual ROIC (as a percentage, 12.34%
 * as 12.34).
 */
export const projectRoic = (
  company,
  projectedInvestedCapital,
  projectedEbit,
  projectedTaxExpenses
) => {
  const rocLong = calculateReturnOnCapitalLong(company);

  let firstResult =
    ((projectedEbit[0] - projectedTaxExpenses[0]) /
      projectedInvestedCapital[0]) *
    100;

  firstResult = Number.isFinite(firstResult) ? firstResult : 0;

  const result = [firstResult];

  for (let i = 1; i < projectedEbit.length - 1; ++i) {
    let entry =
      ((projectedEbit[i] - projectedTaxExpenses[i]) /
        projectedInvestedCapital[i - 1]) *
      100;

    entry = Number.isFinite(entry) ? entry : 0;

    result.push(entry);
  }

  result.push(rocLong);

  return result;
};

/*
 * Projects the Sales to Capital Ratio over the next 10 years.
 *
 * Accepts the company object (object), and accesses salesCap.
 *
 * Returns an array (number[]) of projected Sales to Capital Ratios.
 */
export const projectSalesCap = (company) => {
  const salesCap = company.salesCap;

  return [
    NaN,
    salesCap['next'],
    salesCap['mid'],
    salesCap['mid'],
    salesCap['mid'],
    salesCap['mid'],
    salesCap['mid'] + (salesCap['long'] - salesCap['mid']) / 5,
    salesCap['mid'] + ((salesCap['long'] - salesCap['mid']) * 2) / 5,
    salesCap['mid'] + ((salesCap['long'] - salesCap['mid']) * 3) / 5,
    salesCap['mid'] + ((salesCap['long'] - salesCap['mid']) * 4) / 5,
    salesCap['long'],
    NaN,
  ];
};

/*
 * Projects the Free Cash Flow to Firm (FCFF) projected over the next 10 years.
 *
 * Accepts projectedEbit (number[]), projectedTaxExpense (number[]), and
 * projectedReinvestmentExpense (number[]) as input.
 *
 * Returns an array (number[]) of projected annual FCFF (in millions).
 */
export const projectFcff = (
  projectedEbit,
  projectedTaxExpense,
  projectedReinvestmentExpense
) => {
  const result = [NaN];
  for (let i = 1; i < projectedEbit.length; ++i) {
    result.push(
      projectedEbit[i] -
        projectedTaxExpense[i] -
        projectedReinvestmentExpense[i]
    );
  }
  return result;
};

/*
 * Projects the Net Operating Loss (NOL) carryforward balance.
 *
 * Accepts the company object (object), accesses the nol, and accepts
 * projectedEbit (number[]) as input.
 *
 * Returns an array (number[]) of projected annual NOL balances (in millions).
 */
export const projectNol = (company, projectedEbit) => {
  const nol = company.nol;
  const result = [nol];

  for (let i = 1; i < projectedEbit.length; ++i) {
    let entry;
    if (projectedEbit[i] < result[i - 1]) {
      entry = result[i - 1] - projectedEbit[i];
    } else {
      entry = 0;
    }
    result.push(entry);
  }

  return result;
};

/*
 * Projects the Cost of Capital (CoC) over the next 10 years.
 *
 * Accepts the company object (object), and accesses the cost of capital and
 * risk free rate long term projections and overrides.
 *
 * Returns an array (number[]) of projected annual Cost of Capital (as a
 * percentage, e.g., 8.5% as 8.5).
 */
export const projectCoc = (company) => {
  const coc = calculateCostOfCapital(company);
  const cocLong = calculateCostOfCapitalLong(company);

  return [
    NaN,
    coc,
    coc,
    coc,
    coc,
    coc,
    coc + (cocLong - coc) / 5,
    coc + ((cocLong - coc) * 2) / 5,
    coc + ((cocLong - coc) * 3) / 5,
    coc + ((cocLong - coc) * 4) / 5,
    cocLong,
    cocLong,
  ];
};

/*
 * Projects the annual Discount Factor based on the projected Cost of Capital
 * (CoC) over the next 10 years.
 *
 * Accepts projectedCoc (number[]) as input.
 *
 * Returns an array (number[]) of projected annual discount factors
 * (as a percentage, e.g., 90.91% as 90.91).
 */
export const projectDiscountFactor = (projectedCoc) => {
  const result = [100];

  for (let i = 1; i < projectedCoc.length - 1; ++i) {
    result.push((result[i - 1] * 1) / (1 + projectedCoc[i] / 100));
  }

  result.push(result.at(-1));

  result[0] = NaN;

  return result;
};

/*
 * Projects the Present Value of Free Cash Flow to Firm (PV FCFF) over the next
 * 10 years.
 *
 * Accepts projectedFcff (number[]) and projectedDiscountFactor (number[]) as
 * input.
 *
 * Returns an array (number[]) of projected annual PV FCFF (in millions).
 */
export const projectPvFcff = (projectedFcff, projectedDiscountFactor) => {
  const result = [NaN];

  for (let i = 1; i < projectedFcff.length - 1; ++i) {
    // Discount factor is a percentage
    result.push((projectedFcff[i] * projectedDiscountFactor[i]) / 100);
  }

  result.push(NaN);

  return result;
};

/*
 * Calculates the Terminal Value (TV) of the firm.
 *
 * Accepts projectedFcff (number[]), projectedCoc (number[]), and
 * projectedRevenueGrowthRate (number[]) as input.
 *
 * Returns the Terminal Value (number) in millions.
 */
export const calculateTerminalValue = (
  projectedFcff,
  projectedCoc,
  projectedRevenueGrowthRate
) => {
  const result =
    (projectedFcff.at(-1) /
      (projectedCoc.at(-1) - projectedRevenueGrowthRate.at(-1))) *
    100;

  return Number.isFinite(result) ? result : 0;
};

/*
 * Calculates the Present Value of the Terminal Value.
 *
 * Accepts terminalValue (number) and projectedDiscountFactor (number[]) as input.
 *
 * Returns the Present Value of the Terminal Value (number) in millions.
 */
export const calculatePvTerminalValue = (
  terminalValue,
  projectedDiscountFactor
) => {
  return (terminalValue * projectedDiscountFactor.at(-2)) / 100;
};

/*
 * Calculates the total Present Value of Cash Flows
 *
 * Accepts projectedPvFcff (number[]) as input.
 *
 * Returns the total Present Value of Cash Flows (number) in millions.
 */
export const calculatePvCf = (projectedPvFcff) => {
  return projectedPvFcff.reduce(
    (acc, cur) => (isNaN(cur) ? acc : acc + cur),
    0
  );
};

/*
 * Calculates the Value of Options using the standard Black-Scholes formula.
 *
 * Accepts the company object (object), accessing the stockPrice, optionStrike,
 * optionMaturity, and impliedVol.
 *
 * Returns the Value of Options (number) in millions.
 */
export const calculateValueOfOptions = (
  company,
  rfr = calculateRiskFreeRateLong(company) / 100
) => {
  // NB: This is the standard black-scholes, damodaran uses a dilution adjusted BS
  // S
  const stockPrice = company.stockPrice;
  // X
  const strike = company.optionStrike;
  // T
  const maturity = company.optionMaturity;
  // sig
  const iv = company.impliedVol / 100;
  // r := rfr

  // d1 = (ln(S/X) + (r + sig^2/2) * T) / (sig * sqrt(T))
  const d1 =
    (Math.log(stockPrice / strike) + (rfr + iv ** 2) * maturity) /
    (iv * Math.sqrt(maturity));

  // d2 = d1 - sig * sqrt(T)
  const d2 = d1 - iv * Math.sqrt(maturity);

  // C := S * N(d1) - X * e ** (-r * T) * N(d2)
  const result =
    stockPrice * cdf(d1, 0.0, 1.0) -
    strike * Math.exp(-rfr * maturity) * cdf(d2, 0.0, 1.0);

  return Number.isFinite(result) ? result : 0;
};
