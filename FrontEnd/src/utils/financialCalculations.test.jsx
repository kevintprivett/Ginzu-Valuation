import { beforeEach, vi } from 'vitest';
import * as finCalcs from './financialCalculations';
import {
  Industries,
  Countries,
  Regions,
  DebtRatings,
  CocApproaches,
  BetaApproaches,
  CodCompanyTypes,
  CodApproaches,
  ErpApproaches,
} from './Enums';
import marketData from './marketData';

const rfr = 4.0;

describe('calculateWeight', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('simple array', () => {
    const array = [1, 2, 3];
    const index = 1;
    const expected = 2.0 / 6.0;

    const result = finCalcs.calculateWeight(index, array);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('array of object', () => {
    const array = [
      {
        property: 1,
      },
      {
        property: 2,
      },
      {
        property: 3,
      },
    ];
    const index = 1;
    const expected = 2.0 / 6.0;

    const result = finCalcs.calculateWeight(index, array, 'property');

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('protects from NaN', () => {
    const array = [
      {
        property: 0,
      },
      {
        property: 0,
      },
      {
        property: 0,
      },
    ];
    const index = 1;
    const expected = 0;

    const result = finCalcs.calculateWeight(index, array, 'property');

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });
});

describe('calculateCostOfCapital', () => {
  test('Direct approach', () => {
    const company = {
      cocApproach: CocApproaches.DIRECT,
      cocDirect: 12.34,
    };
    const expected = 12.34;

    const result = finCalcs.calculateCostOfCapital(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Average approach', () => {
    const company = {
      cocApproach: CocApproaches.AVERAGE,
      businesses: [
        {
          business: Industries.ADVERTISING,
          revenue: 1000,
        },
        {
          business: Industries.AEROSPACE_DEFENSE,
          revenue: 1000,
        },
      ],
    };
    const firstEv =
      marketData.industries[Industries.ADVERTISING]['EV/Sales'] * 1000;
    const firstCoc =
      marketData.industries[Industries.ADVERTISING]['Cost of Capital'];
    const secondEv =
      marketData.industries[Industries.AEROSPACE_DEFENSE]['EV/Sales'] * 1000;
    const secondCoc =
      marketData.industries[Industries.AEROSPACE_DEFENSE]['Cost of Capital'];

    const expected =
      (firstEv * firstCoc + secondEv * secondCoc) / (firstEv + secondEv);

    const result = finCalcs.calculateCostOfCapital(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Detailed approach', () => {
    const company = {
      cocApproach: CocApproaches.DETAILED,
      stockPrice: 100,
      shares: 100,
      preferredPrice: 100,
      preferredShares: 100,
      preferredDividend: 10,
      interestExpense: 0,
      averageMaturity: 1,
      debt: {
        Q10: 100,
      },
      betaApproach: BetaApproaches.DIRECT,
      betaDirect: 1,
      erpApproach: ErpApproaches.DIRECT,
      erpDirect: 12.34,
      codApproach: CodApproaches.DIRECT,
      codDirect: 11.11,
      taxRateMarginal: 0,
      overrides: {
        rfrLong: false,
      },
    };

    const valueOfEquity = 100 * 100;
    const valueOfPreferred = 100 * 100;
    const valueOfDebt = 100 / 1.1;
    const totalCapital = valueOfEquity + valueOfPreferred + valueOfDebt;

    const cop = 10.0;
    const cod = 11.11;
    const coe = rfr + 12.34;

    const expected =
      (valueOfEquity / totalCapital) * coe +
      (valueOfDebt / totalCapital) * cod +
      (valueOfPreferred / totalCapital) * cop;

    const result = finCalcs.calculateCostOfCapital(company);

    expect(result).toBeCloseTo(expected, 1);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Average - protects from NaN', () => {
    const company = {
      cocApproach: CocApproaches.AVERAGE,
      businesses: [
        {
          business: Industries.ADVERTISING,
          revenue: 0,
        },
        {
          business: Industries.AEROSPACE_DEFENSE,
          revenue: 0,
        },
      ],
    };

    const expected = 0;

    const result = finCalcs.calculateCostOfCapital(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Detailed - protect from Inf', () => {
    const company = {
      cocApproach: CocApproaches.DETAILED,
      stockPrice: 100,
      shares: 100,
      preferredPrice: -100,
      preferredShares: 100,
      preferredDividend: 10,
      interestExpense: 0,
      averageMaturity: 1,
      debt: {
        Q10: 0,
      },
      betaApproach: BetaApproaches.DIRECT,
      betaDirect: 1,
      erpApproach: ErpApproaches.DIRECT,
      erpDirect: 12.34,
      codApproach: CodApproaches.DIRECT,
      codDirect: 11.11,
      taxRateMarginal: 0,
      overrides: {
        rfrLong: false,
      },
    };

    const expected = 0;

    const result = finCalcs.calculateCostOfCapital(company);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });
});

describe('calculateCostOfEquity', () => {
  test('Cost of Equity - Direct Beta', () => {
    const company = {
      betaApproach: BetaApproaches.DIRECT,
      betaDirect: 1,
      erpApproach: ErpApproaches.DIRECT,
      erpDirect: 12.34,
      overrides: {
        rfrLong: false,
      },
    };

    const expected = rfr + 12.34;

    const result = finCalcs.calculateCostOfEquity(company);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Cost of Equity - Single Beta', () => {
    const company = {
      codApproach: CodApproaches.DIRECT,
      codDirect: 10,
      interestExpense: 0,
      averageMaturity: 1,
      debt: {
        Q10: 0,
      },
      stockPrice: 10,
      shares: 10,
      betaApproach: BetaApproaches.SINGLE,
      erpApproach: ErpApproaches.DIRECT,
      erpDirect: 12.34,
      taxRateMarginal: 10,
      industry: Industries.ADVERTISING,
      overrides: {
        rfrLong: false,
      },
    };

    const leveredBeta = marketData.industries[Industries.ADVERTISING]['Beta'];

    const expected = rfr + leveredBeta * 12.34;

    const result = finCalcs.calculateCostOfEquity(company);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Cost of Equity - Single Beta - protects against Inf', () => {
    const company = {
      codApproach: CodApproaches.DIRECT,
      codDirect: 10,
      interestExpense: 0,
      averageMaturity: 1,
      debt: {
        Q10: 110,
      },
      stockPrice: 0,
      shares: 10,
      betaApproach: BetaApproaches.SINGLE,
      erpApproach: ErpApproaches.DIRECT,
      erpDirect: 12.34,
      taxRateMarginal: 10,
      industry: Industries.ADVERTISING,
      overrides: {
        rfrLong: false,
      },
    };

    const expected = rfr;

    const result = finCalcs.calculateCostOfEquity(company);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });
});

describe('calculateCostOfDebt', () => {
  test('Direct approach', () => {
    const company = {
      codApproach: CodApproaches.DIRECT,
      codDirect: 12.34,
      taxRateMarginal: 10,
      overrides: {
        rfrLong: false,
      },
    };
    const expected = 12.34 * 0.9;

    const result = finCalcs.calculateCostOfDebt(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Synthetic approach', () => {
    const company = {
      codApproach: CodApproaches.SYNTHETIC,
      taxRateMarginal: 10,
      codCompanyType: CodCompanyTypes.SAFE,
      ebit: {
        Q10: 100,
      },
      interestExpense: {
        Q10: 0,
      },
      overrides: {
        rfrLong: false,
      },
    };

    const creditSpread = marketData.credit_ratings[DebtRatings.AAA]['Spread'];

    const expected = (rfr + creditSpread) * 0.9;

    const result = finCalcs.calculateCostOfDebt(company);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Actual approach', () => {
    const company = {
      codApproach: CodApproaches.ACTUAL,
      debtRating: DebtRatings.AAA,
      taxRateMarginal: 10,
      overrides: {
        rfrLong: false,
      },
    };

    const creditSpread = marketData.credit_ratings[DebtRatings.AAA]['Spread'];

    const expected = (rfr + creditSpread) * 0.9;

    const result = finCalcs.calculateCostOfDebt(company);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });
});

describe('calculateCostOfPreferred', () => {
  test('Basic test', () => {
    const company = {
      preferredDividend: 10,
      preferredPrice: 100,
    };
    const expected = 10;

    const result = finCalcs.calculateCostOfPreferred(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('protects from NaN', () => {
    const company = {
      preferredDividend: 0,
      preferredPrice: 0,
    };
    const expected = 0;

    const result = finCalcs.calculateCostOfPreferred(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('protects from Infinity', () => {
    const company = {
      preferredDividend: 10,
      preferredPrice: 0,
    };
    const expected = 0;

    const result = finCalcs.calculateCostOfPreferred(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });
});

describe('calculateValueOfDebt', () => {
  test('Basic test', () => {
    const company = {
      interestExpense: {
        Q10: 10,
      },
      debtMaturity: 10,
      debt: {
        Q10: 100,
      },
      codApproach: CodApproaches.DIRECT,
      codDirect: 10,
      taxRateMarginal: 0,
      overrides: {
        rfrLong: false,
      },
    };
    const expected = 100;

    const result = finCalcs.calculateValueOfDebt(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('protects from NaN', () => {
    const company = {
      interestExpense: {
        Q10: 0,
      },
      debtMaturity: 10,
      debt: {
        Q10: 100,
      },
      codApproach: CodApproaches.DIRECT,
      codDirect: 0,
      taxRateMarginal: 0,
      overrides: {
        rfrLong: false,
      },
    };
    const expected = 0;

    const result = finCalcs.calculateValueOfDebt(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('protects from Infinity', () => {
    const company = {
      interestExpense: {
        Q10: 10,
      },
      debtMaturity: 10,
      debt: {
        Q10: 100,
      },
      codApproach: CodApproaches.DIRECT,
      codDirect: 0,
      taxRateMarginal: 0,
      overrides: {
        rfrLong: false,
      },
    };
    const expected = 0;

    const result = finCalcs.calculateValueOfDebt(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });
});

describe('calculateValueOfEquity', () => {
  test('Basic test', () => {
    const company = {
      stockPrice: 10,
      shares: 100,
    };
    const expected = 1000;

    const result = finCalcs.calculateValueOfEquity(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });
});

describe('calculateValueOfPreferred', () => {
  test('Basic test', () => {
    const company = {
      preferredPrice: 10,
      preferredShares: 100,
    };
    const expected = 1000;

    const result = finCalcs.calculateValueOfPreferred(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });
});

describe('calculateUnleveredBeta', () => {
  test('Direct approach', () => {
    const company = {
      betaApproach: BetaApproaches.DIRECT,
      betaDirect: 1.23,
    };
    const expected = 1.23;

    const result = finCalcs.calculateUnleveredBeta(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Single approach', () => {
    const company = {
      betaApproach: BetaApproaches.SINGLE,
      industry: Industries.ADVERTISING,
    };

    const expected = marketData.industries[Industries.ADVERTISING]['Beta'];

    const result = finCalcs.calculateUnleveredBeta(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Multi approach', () => {
    const company = {
      betaApproach: BetaApproaches.MULTI,
      businesses: [
        {
          revenue: 100,
          business: Industries.ADVERTISING,
        },
        {
          revenue: 100,
          business: Industries.AEROSPACE_DEFENSE,
        },
      ],
    };

    const firstBusinessEv =
      marketData.industries[Industries.ADVERTISING]['EV/Sales'] * 100;
    const firstBusinessBeta =
      marketData.industries[Industries.ADVERTISING]['Beta'];
    const secondBusinessEv =
      marketData.industries[Industries.AEROSPACE_DEFENSE]['EV/Sales'] * 100;
    const secondBusinessBeta =
      marketData.industries[Industries.AEROSPACE_DEFENSE]['Beta'];

    const expected =
      (firstBusinessEv * firstBusinessBeta +
        secondBusinessEv * secondBusinessBeta) /
      (firstBusinessEv + secondBusinessEv);

    const result = finCalcs.calculateUnleveredBeta(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Multi - protect from NaN', () => {
    const company = {
      betaApproach: BetaApproaches.MULTI,
      businesses: [
        {
          revenue: 0,
          business: Industries.ADVERTISING,
        },
        {
          revenue: 0,
          business: Industries.AEROSPACE_DEFENSE,
        },
      ],
    };

    const expected = 0;

    const result = finCalcs.calculateUnleveredBeta(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });
});

describe('calculateErp', () => {
  test('Direct approach', () => {
    const company = {
      erpApproach: ErpApproaches.DIRECT,
      erpDirect: 12.34,
    };
    const expected = 12.34;

    const result = finCalcs.calculateErp(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Country approach', () => {
    const company = {
      erpApproach: ErpApproaches.COUNTRY,
    };

    const expected = marketData.countries[Countries.UNITED_STATES]['ERP'];

    const result = finCalcs.calculateErp(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Countries approach', () => {
    const company = {
      erpApproach: ErpApproaches.COUNTRIES,
      countries: [
        {
          revenue: 100,
          country: Countries.UNITED_STATES,
        },
        {
          revenue: 100,
          country: Countries.ABU_DHABI,
        },
      ],
    };

    const firstCountryErp =
      marketData.countries[Countries.UNITED_STATES]['ERP'];
    const secondCountryErp = marketData.countries[Countries.ABU_DHABI]['ERP'];

    const expected = (100 * firstCountryErp + 100 * secondCountryErp) / 200;

    const result = finCalcs.calculateErp(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Regions approach', () => {
    const company = {
      erpApproach: ErpApproaches.REGIONS,
      regions: [
        {
          revenue: 100,
          region: Regions.AFRICA,
        },
        {
          revenue: 100,
          region: Regions.ASIA,
        },
      ],
    };

    const firstRegionErp = marketData.regions[Regions.AFRICA]['ERP'];
    const secondRegionErp = marketData.regions[Regions.ASIA]['ERP'];

    const expected = (100 * firstRegionErp + 100 * secondRegionErp) / 200;

    const result = finCalcs.calculateErp(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Countries - protect against NaN', () => {
    const company = {
      erpApproach: ErpApproaches.COUNTRIES,
      countries: [
        {
          revenue: 0,
          country: Countries.UNITED_STATES,
        },
        {
          revenue: 0,
          country: Countries.ABU_DHABI,
        },
      ],
    };

    const expected = 0;

    const result = finCalcs.calculateErp(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Regions - protect against NaN', () => {
    const company = {
      erpApproach: ErpApproaches.REGIONS,
      regions: [
        {
          revenue: 0,
          region: Regions.AFRICA,
        },
        {
          revenue: 0,
          region: Regions.ASIA,
        },
      ],
    };

    const expected = 0;

    const result = finCalcs.calculateErp(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });
});

describe('calculateSyntheticRating', () => {
  test('Safe: AAA', () => {
    const company = {
      codCompanyType: CodCompanyTypes.SAFE,
      ebit: {
        Q10: 100,
      },
      interestExpense: {
        Q10: 0,
      },
    };
    const expected = DebtRatings.AAA;

    const result = finCalcs.calculateSyntheticRating(company);

    expect(result).toBe(expected);
    expect(typeof result === 'string').toBe(true);
  });

  test('Safe: D', () => {
    const company = {
      codCompanyType: CodCompanyTypes.SAFE,
      ebit: {
        Q10: 1,
      },
      interestExpense: {
        Q10: 100,
      },
    };
    const expected = DebtRatings.D;

    const result = finCalcs.calculateSyntheticRating(company);

    expect(result).toBe(expected);
    expect(typeof result === 'string').toBe(true);
  });

  test('Risky: AAA', () => {
    const company = {
      codCompanyType: CodCompanyTypes.RISKY,
      ebit: {
        Q10: 100,
      },
      interestExpense: {
        Q10: 0,
      },
    };
    const expected = DebtRatings.AAA;

    const result = finCalcs.calculateSyntheticRating(company);

    expect(result).toBe(expected);
    expect(typeof result === 'string').toBe(true);
  });

  test('Risky: D', () => {
    const company = {
      codCompanyType: CodCompanyTypes.RISKY,
      ebit: {
        Q10: 1,
      },
      interestExpense: {
        Q10: 100,
      },
    };
    const expected = DebtRatings.D;

    const result = finCalcs.calculateSyntheticRating(company);

    expect(result).toBe(expected);
    expect(typeof result === 'string').toBe(true);
  });
});

describe('calculateRevenueGrowthRate', () => {
  test('Basic test', () => {
    const company = {
      revenues: {
        Q10: 110,
        K10: 100,
      },
      years10k: 1,
    };
    const expected = 10;

    const result = finCalcs.calculateRevenueGrowthRate(company);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Basic test: non-1 years10k', () => {
    const company = {
      revenues: {
        Q10: 110,
        K10: 100,
      },
      years10k: 0.75,
    };
    const expected = 13.33;

    const result = finCalcs.calculateRevenueGrowthRate(company);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Protects from NaN', () => {
    const company = {
      revenues: {
        Q10: 0,
        K10: 0,
      },
      years10k: 1,
    };
    const expected = 0;

    const result = finCalcs.calculateRevenueGrowthRate(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Protects from Inf', () => {
    const company = {
      revenues: {
        Q10: 110,
        K10: 0,
      },
      years10k: 1,
    };
    const expected = 0;

    const result = finCalcs.calculateRevenueGrowthRate(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });
});

describe('calculateOperatingMargin', () => {
  test('Basic test', () => {
    const company = {
      revenues: {
        Q10: 100,
      },
      ebit: {
        Q10: 10,
      },
      hasRdExpenses: false,
    };
    const expected = 10;

    const result = finCalcs.calculateOperatingMargin(company);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('With R&D', () => {
    const company = {
      revenues: {
        Q10: 100,
      },
      ebit: {
        Q10: 10,
      },
      hasRdExpenses: true,
      rdExpenses: [5, 10, 10, 10],
    };

    const expected = 5;

    const result = finCalcs.calculateOperatingMargin(company);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });
  test('Protects from NaN', () => {
    const company = {
      revenues: {
        Q10: 0,
      },
      ebit: {
        Q10: 0,
      },
      hasRdExpenses: false,
    };
    const expected = 0;

    const result = finCalcs.calculateOperatingMargin(company);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Protects from Inf', () => {
    const company = {
      revenues: {
        Q10: 0,
      },
      ebit: {
        Q10: 10,
      },
      hasRdExpenses: false,
    };
    const expected = 0;

    const result = finCalcs.calculateOperatingMargin(company);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });
  test('With R&D - protects from NaN', () => {
    const company = {
      revenues: {
        Q10: 100,
      },
      ebit: {
        Q10: 10,
      },
      hasRdExpenses: true,
      rdExpenses: [],
    };

    const expected = 10;

    const result = finCalcs.calculateOperatingMargin(company);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });
});

describe('calculateSalesCapRatio', () => {
  test('Basic test', () => {
    const company = {
      revenues: {
        Q10: 100,
      },
      equity: {
        Q10: 100,
      },
      debt: {
        Q10: 100,
      },
      cash: {
        Q10: 100,
      },
      hasRdExpenses: false,
    };

    const expected = 1;

    const result = finCalcs.calculateSalesCapRatio(company);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('With R&D', () => {
    const company = {
      revenues: {
        Q10: 100,
      },
      equity: {
        Q10: 100,
      },
      debt: {
        Q10: 100,
      },
      cash: {
        Q10: 100,
      },
      hasRdExpenses: true,
      rdExpenses: [50, 100, 100, 100],
    };

    const expected = 0.5;

    const result = finCalcs.calculateSalesCapRatio(company);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Protects from NaN', () => {
    const company = {
      revenues: {
        Q10: 0,
      },
      equity: {
        Q10: 0,
      },
      debt: {
        Q10: 0,
      },
      cash: {
        Q10: 0,
      },
      hasRdExpenses: false,
    };

    const expected = 0;

    const result = finCalcs.calculateSalesCapRatio(company);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Protects from Inf', () => {
    const company = {
      revenues: {
        Q10: 100,
      },
      equity: {
        Q10: 0,
      },
      debt: {
        Q10: 0,
      },
      cash: {
        Q10: 0,
      },
      hasRdExpenses: false,
    };

    const expected = 0;

    const result = finCalcs.calculateSalesCapRatio(company);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });
});

describe('calculateInvestedCapital', () => {
  test('Basic test', () => {
    const company = {
      equity: {
        Q10: 100,
      },
      debt: {
        Q10: 100,
      },
      cash: {
        Q10: 100,
      },
      hasRdExpenses: false,
    };

    const expected = 100;

    const result = finCalcs.calculateInvestedCapital(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('With R&D', () => {
    const company = {
      equity: {
        Q10: 100,
      },
      debt: {
        Q10: 100,
      },
      cash: {
        Q10: 100,
      },
      hasRdExpenses: true,
      rdExpenses: [50, 100, 100, 100],
    };

    const expected = 200;

    const result = finCalcs.calculateInvestedCapital(company);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });
});

describe('calculateReturnOnCapital', () => {
  test('Basic test', () => {
    const company = {
      ebit: {
        Q10: 10,
      },
      taxRateEffective: 10.0,
      equity: {
        Q10: 100,
      },
      debt: {
        Q10: 100,
      },
      cash: {
        Q10: 100,
      },
      hasRdExpenses: false,
    };

    const expected = 9;

    const result = finCalcs.calculateReturnOnCapital(company);

    expect(result).toBe(expected);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('With R&D', () => {
    const company = {
      ebit: {
        Q10: 10,
      },
      taxRateEffective: 10.0,
      equity: {
        Q10: 100,
      },
      debt: {
        Q10: 100,
      },
      cash: {
        Q10: 100,
      },
      hasRdExpenses: true,
      rdExpenses: [50, 100, 100, 100],
    };

    const expected = 4.5;

    const result = finCalcs.calculateReturnOnCapital(company);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Protects from NaN', () => {
    const company = {
      ebit: {
        Q10: 0,
      },
      taxRateEffective: 10.0,
      equity: {
        Q10: 100,
      },
      debt: {
        Q10: 0,
      },
      cash: {
        Q10: 100,
      },
      hasRdExpenses: false,
    };

    const expected = 0;

    const result = finCalcs.calculateReturnOnCapital(company);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Protects from Infinity', () => {
    const company = {
      ebit: {
        Q10: 10,
      },
      taxRateEffective: 10.0,
      equity: {
        Q10: 100,
      },
      debt: {
        Q10: 0,
      },
      cash: {
        Q10: 100,
      },
      hasRdExpenses: false,
    };

    const expected = 0;

    const result = finCalcs.calculateReturnOnCapital(company);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });
});

describe('projectRevenueGrowthRate', () => {
  test('Basic test', () => {
    const company = {
      revenues: {
        Q10: 110,
        K10: 100,
      },
      years10k: 1,
      revenueGrowth: {
        next: 10,
        mid: 20,
        long: 30,
      },
      overrides: {
        revenueGrowth: true,
      },
    };

    const expected = [10, 10, 20, 20, 20, 20, 22, 24, 26, 28, 30, 30];

    const result = finCalcs.projectRevenueGrowthRate(company);

    for (let i = 0; i < expected.length; ++i) {
      expect(result[i]).toBeCloseTo(expected[i], 2);
    }
  });
});

describe('projectRevenue', () => {
  test('Basic test', () => {
    const company = {
      revenues: {
        Q10: 100,
      },
    };

    const projectedArg0 = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];

    const expected = [
      100, 110, 121, 133.1, 146.41, 161.05, 177.16, 194.87, 214.36, 235.79,
      259.37, 285.31,
    ];

    const result = finCalcs.projectRevenue(company, projectedArg0);

    for (let i = 0; i < expected.length; ++i) {
      expect(result[i]).toBeCloseTo(expected[i], 2);
    }
  });
});

describe('projectOperatingMargin', () => {
  test('Basic test', () => {
    const company = {
      revenues: {
        Q10: 100,
      },
      ebit: {
        Q10: 10,
      },
      hasRdExpenses: false,
      operatingMargin: {
        next: 10,
        mid: 20,
        long: 30,
      },
    };

    const expected = [10, 10, 20, 20, 20, 20, 22, 24, 26, 28, 30, 30];

    const result = finCalcs.projectOperatingMargin(company);

    for (let i = 0; i < expected.length; ++i) {
      expect(result[i]).toBeCloseTo(expected[i], 2);
    }
  });
});

describe('projectEbit', () => {
  test('Basic test', () => {
    const company = {
      ebit: {
        Q10: 10,
      },
    };

    const projectedArg0 = [
      100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
    ];

    const projectedArg1 = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

    const expected = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

    const result = finCalcs.projectEbit(company, projectedArg0, projectedArg1);

    for (let i = 0; i < expected.length; ++i) {
      expect(result[i]).toBeCloseTo(expected[i], 2);
    }
  });
});

describe('projectTaxRate', () => {
  test('Basic test', () => {
    const company = {
      taxRateEffective: 10,
      overrides: {
        taxRateEffectiveLong: true,
      },
      taxRateEffectiveLong: 20,
    };

    const expected = [10, 10, 10, 10, 10, 10, 12, 14, 16, 18, 20, 20];

    const result = finCalcs.projectTaxRate(company);

    for (let i = 0; i < expected.length; ++i) {
      expect(result[i]).toBeCloseTo(expected[i], 2);
    }
  });
});

describe('projectTaxExpense', () => {
  test('Basic test', () => {
    const ebit = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];

    const taxRate = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];

    const nol = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    const expected = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];

    const result = finCalcs.projectTaxExpense(ebit, taxRate, nol);

    for (let i = 0; i < expected.length; ++i) {
      expect(result[i]).toBeCloseTo(expected[i], 2);
    }
  });

  test('High NOL', () => {
    const ebit = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];

    const taxRate = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];

    const nol = [
      1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000,
    ];

    const expected = [10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    const result = finCalcs.projectTaxExpense(ebit, taxRate, nol);

    for (let i = 0; i < expected.length; ++i) {
      expect(result[i]).toBeCloseTo(expected[i], 2);
    }
  });

  test('Mid NOL', () => {
    const ebit = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];

    const taxRate = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];

    const nol = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];

    const expected = [10, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9];

    const result = finCalcs.projectTaxExpense(ebit, taxRate, nol);

    for (let i = 0; i < expected.length; ++i) {
      expect(result[i]).toBeCloseTo(expected[i], 2);
    }
  });
});

describe('projectReinvestmentExpense', () => {
  test('Basic test', () => {
    const company = {
      overrides: {
        rocLong: true,
        rfrLong: true,
      },
      rfrLong: 10,
      rocLong: 10,
      salesCap: {
        next: 1,
        mid: 1,
        long: 1,
      },
    };

    const revGrowth = [10];

    const rev = [100, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200];

    const ebit = [10];

    const tax = [0];

    const expected = [NaN, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];

    const result = finCalcs.projectReinvestmentExpense(
      company,
      revGrowth,
      rev,
      ebit,
      tax
    );

    for (let i = 1; i < expected.length; ++i) {
      expect(result[i]).toBeCloseTo(expected[i], 2);
    }
  });
});

describe('projectInvestedCapital', () => {
  test('Basic test', () => {
    const company = {
      equity: {
        Q10: 100,
      },
      debt: {
        Q10: 100,
      },
      cash: {
        Q10: 100,
      },
      hasRdExpenses: false,
    };

    const reinvest = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];

    const expected = [
      100,
      110,
      120,
      130,
      140,
      150,
      160,
      170,
      180,
      190,
      200,
      NaN,
    ];

    const result = finCalcs.projectInvestedCapital(company, reinvest);

    for (let i = 0; i < expected.length - 1; ++i) {
      expect(result[i]).toBeCloseTo(expected[i], 2);
    }
  });
});

describe('projectRoic', () => {
  test('Basic test', () => {
    const company = {
      equity: {
        Q10: 100,
      },
      debt: {
        Q10: 100,
      },
      cash: {
        Q10: 100,
      },
      hasRdExpenses: false,
      rfrLong: 10,
      rocLong: 10,
      overrides: {
        rocLong: true,
        rfrLong: true,
      },
    };

    const capital = [
      100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 200,
    ];

    const ebit = [11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11];

    const tax = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

    const expected = [
      (10 / 100) * 100,
      (10 / 100) * 100,
      (10 / 110) * 100,
      (10 / 120) * 100,
      (10 / 130) * 100,
      (10 / 140) * 100,
      (10 / 150) * 100,
      (10 / 160) * 100,
      (10 / 170) * 100,
      (10 / 180) * 100,
      (10 / 190) * 100,
      10,
    ];

    const result = finCalcs.projectRoic(company, capital, ebit, tax);

    for (let i = 0; i < expected.length; ++i) {
      expect(result[i]).toBeCloseTo(expected[i], 2);
    }
  });

  test('Protects from NaN', () => {
    const company = {
      equity: {
        Q10: 100,
      },
      debt: {
        Q10: 100,
      },
      cash: {
        Q10: 100,
      },
      hasRdExpenses: false,
      rfrLong: 10,
      rocLong: 10,
      overrides: {
        rocLong: true,
        rfrLong: true,
      },
    };

    const capital = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    const ebit = [11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11];

    const tax = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

    const expected = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10];

    const result = finCalcs.projectRoic(company, capital, ebit, tax);

    for (let i = 0; i < expected.length; ++i) {
      expect(result[i]).toBeCloseTo(expected[i], 2);
    }
  });
});

describe('projectSalesCap', () => {
  test('Basic test', () => {
    const company = {
      salesCap: {
        next: 10,
        mid: 20,
        long: 30,
      },
    };

    const expected = [NaN, 10, 20, 20, 20, 20, 22, 24, 26, 28, 30, NaN];

    const result = finCalcs.projectSalesCap(company);

    for (let i = 1; i < expected.length - 1; ++i) {
      expect(result[i]).toBeCloseTo(expected[i], 2);
    }
  });
});

describe('projectFcff', () => {
  test('Basic test', () => {
    const ebit = [11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11];

    const tax = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

    const reinvest = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];

    const expected = [NaN, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];

    const result = finCalcs.projectFcff(ebit, tax, reinvest);

    for (let i = 1; i < expected.length; ++i) {
      expect(result[i]).toBeCloseTo(expected[i], 2);
    }
  });
});

describe('projectNol', () => {
  test('Profitable company', () => {
    const company = {
      nol: 50,
    };

    const ebit = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];

    const expected = [50, 40, 30, 20, 10, 0, 0, 0, 0, 0, 0, 0];

    const result = finCalcs.projectNol(company, ebit);

    for (let i = 0; i < expected.length; ++i) {
      expect(result[i]).toBeCloseTo(expected[i], 2);
    }
  });

  test('Unprofitable company', () => {
    const company = {
      nol: 50,
    };

    const ebit = [-10, -10, -10, -10, -10, -10, -10, -10, -10, -10, -10, -10];

    const expected = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160];

    const result = finCalcs.projectNol(company, ebit);

    for (let i = 0; i < expected.length; ++i) {
      expect(result[i]).toBeCloseTo(expected[i], 2);
    }
  });
});

describe('projectCoc', () => {
  test('Basic test', () => {
    const company = {
      cocApproach: CocApproaches.DIRECT,
      cocDirect: 10,
      cocLong: 20,
      overrides: {
        cocLong: true,
        rfrLong: true,
      },
    };

    const expected = [NaN, 10, 10, 10, 10, 10, 12, 14, 16, 18, 20, 20];

    const result = finCalcs.projectCoc(company);

    for (let i = 1; i < expected.length; ++i) {
      expect(result[i]).toBeCloseTo(expected[i], 2);
    }
  });
});

describe('projectDiscountFactor', () => {
  test('Basic test', () => {
    const coc = [NaN, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];

    const expected = [
      NaN,
      90.91,
      82.64,
      75.13,
      68.3,
      62.09,
      56.45,
      51.32,
      46.65,
      42.41,
      38.55,
      38.55,
    ];

    const result = finCalcs.projectDiscountFactor(coc);

    expect(result[0]).toBe(NaN);

    for (let i = 1; i < expected.length; ++i) {
      expect(result[i]).toBeCloseTo(expected[i], 2);
    }
  });
});

describe('projectPvFcff', () => {
  test('Basic test', () => {
    const fcff = [NaN, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];

    const df = [
      100,
      90.91,
      82.64,
      75.13,
      68.3,
      62.09,
      56.45,
      51.32,
      46.65,
      42.41,
      38.55,
      NaN,
    ];

    const expected = [
      NaN,
      9.09,
      8.26,
      7.51,
      6.83,
      6.21,
      5.645,
      5.13,
      4.67,
      4.24,
      3.86,
      NaN,
    ];

    const result = finCalcs.projectPvFcff(fcff, df);

    for (let i = 1; i < expected.length - 1; ++i) {
      expect(result[i]).toBeCloseTo(expected[i], 2);
    }
  });
});

describe('calculateTerminalValue', () => {
  test('Basic test', () => {
    const fcff = [10];

    const coc = [10];

    const growth = [5];

    const expected = 200;

    const result = finCalcs.calculateTerminalValue(fcff, coc, growth);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Protects from NaN', () => {
    const fcff = [0];

    const coc = [10];

    const growth = [10];

    const expected = 0;

    const result = finCalcs.calculateTerminalValue(fcff, coc, growth);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('Protects from infinity', () => {
    const fcff = [10];

    const coc = [10];

    const growth = [10];

    const expected = 0;

    const result = finCalcs.calculateTerminalValue(fcff, coc, growth);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });
});

describe('calculatePvTerminalValue', () => {
  test('Basic test', () => {
    const terminalValue = 100;
    const df = [30, NaN];

    const expected = 30;

    const result = finCalcs.calculatePvTerminalValue(terminalValue, df);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });
});

describe('calculatePvCf', () => {
  test('Basic test', () => {
    const pvCf = [NaN, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, NaN];

    const expected = 100;

    const result = finCalcs.calculatePvCf(pvCf);

    expect(result).toBeCloseTo(expected, 2);
    expect(Number.isFinite(result)).toBe(true);
  });
});

describe('calculateValueOfOptions', () => {
  test('Basic test', () => {
    const company = {
      stockPrice: 100,
      optionStrike: 80,
      optionMaturity: 3,
      impliedVol: 20,
    };

    const rfr = 0.04;

    const expected = 31.498;

    const result = finCalcs.calculateValueOfOptions(company, rfr);

    expect(result).toBeCloseTo(expected, 0);
    expect(Number.isFinite(result)).toBe(true);
  });
});
