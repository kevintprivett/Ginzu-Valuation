import { createSlice } from '@reduxjs/toolkit'
import dayjs from 'dayjs'

import {
  Industries,
  Countries,
  Regions,
  CocApproaches,
  BetaApproaches,
  ErpApproaches,
  CodApproaches,
  CodCompanyTypes,
  DebtRatings
} from '../utils/Enums'

const initialState = {
  valuationDate: dayjs().format('YYYY-MM-DD'),
  name: "",
  ticker: "",
  industry: Industries.BLANK,
  stockPrice: 0,
  years10k: 1,
  revenues: {
    Q10: 0,
    K10: 0
  },
  ebit: {
    Q10: 0,
    K10: 0
  },
  interestExpense: {
    Q10: 0,
    K10: 0
  },
  equity: {
    Q10: 0,
    K10: 0
  },
  debt: {
    Q10: 0,
    K10: 0
  },
  debtMaturity: 0,
  cash: {
    Q10: 0,
    K10: 0
  },
  nonOperatingAssets: {
    Q10: 0,
    K10: 0
  },
  minorityInterests: {
    Q10: 0,
    K10: 0
  },
  nol: 0,
  taxRateMarginal: 21,
  taxRateEffective: 21,
  shares: 0,
  cocApproach: CocApproaches.DETAILED,
  cocDirect: 0,
  businesses: [{
    business: Industries.BLANK,
    revenue: 0
  }],
  betaApproach: BetaApproaches.SINGLE,
  betaDirect: 0,
  erpApproach: ErpApproaches.COUNTRY,
  erpDirect: 0,
  countries: [{
    'country': Countries.UNITED_STATES,
    'revenue': 0
  }],
  regions: [{
    'region': Regions.NORTH_AMERICA,
    'revenue': 0
  }],
  codApproach: CodApproaches.ACTUAL,
  codDirect: 0,
  codCompanyType: CodCompanyTypes.SAFE,
  debtRating: DebtRatings.BLANK,
  preferredShares: 0,
  preferredPrice: 0,
  preferredDividend: 0,
  hasOptions: false,
  optionOutstanding: 0,
  optionStrike: 0,
  optionMaturity: 0,
  impliedVol: 0,
  hasRdExpenses: false,
  rdExpenses: [0],
  revenueGrowth: {
    'next': 0,
    'mid': 0,
    'long': 0
  },
  operatingMargin: {
    'next': 0,
    'mid': 0,
    'long': 0
  },
  salesCap: {
    'next': 0,
    'mid': 0,
    'long': 0
  },
  cocLong: 0,
  rocLong: 0,
  taxRateEffectiveLong: 0,
  rfrLong: 0,
  failureChance: 0,
  overrides: {
    'revenueGrowth': false,
    'cocLong': false,
    'rocLong': false,
    'taxRateEffectiveLong': false,
    'rfrLong': false,
    'failureChance': false,
  }
}

// eslint-disable-next-line no-unused-vars
const testCompany = {
  valuationDate: dayjs().format('YYYY-MM-DD'),
  name: "test company",
  ticker: "TST",
  industry: Industries.ADVERTISING,
  stockPrice: 25,
  years10k: 1,
  revenues: {
    Q10: 4500,
    K10: 4000
  },
  ebit: {
    Q10: 440,
    K10: 400
  },
  interestExpense: {
    Q10: 220,
    K10: 200
  },
  equity: {
    Q10: 4000,
    K10: 4000
  },
  debt: {
    Q10: 400,
    K10: 400
  },
  debtMaturity: 3,
  cash: {
    Q10: 100,
    K10: 95
  },
  nonOperatingAssets: {
    Q10: 10,
    K10: 10
  },
  minorityInterests: {
    Q10: 10,
    K10: 10
  },
  nol: 0,
  taxRateMarginal: 21,
  taxRateEffective: 21,
  shares: 100,
  cocApproach: CocApproaches.DETAILED,
  cocDirect: 0,
  businesses: [{
    business: Industries.Advertising,
    revenue: 4000
  }],
  betaApproach: BetaApproaches.SINGLE,
  betaDirect: 0,
  erpApproach: ErpApproaches.COUNTRY,
  erpDirect: 0,
  countries: [{
    'country': Countries.UNITED_STATES,
    'revenue': 4000
  }],
  regions: [{
    'region': Regions.NORTH_AMERICA,
    'revenue': 4000
  }],
  codApproach: CodApproaches.ACTUAL,
  codDirect: 0,
  codCompanyType: CodCompanyTypes.SAFE,
  debtRating: DebtRatings.AA,
  preferredShares: 0,
  preferredPrice: 0,
  preferredDividend: 0,
  hasOptions: false,
  optionOutstanding: 0,
  optionStrike: 0,
  optionMaturity: 0,
  impliedVol: 0,
  hasRdExpenses: false,
  rdExpenses: [0],
  revenueGrowth: {
    'next': 10,
    'mid': 10,
    'long': 0
  },
  operatingMargin: {
    'next': 15,
    'mid': 15,
    'long': 15 
  },
  salesCap: {
    'next': 1.5,
    'mid': 1.5,
    'long': 1.5 
  },
  cocLong: 0,
  rocLong: 0,
  taxRateEffectiveLong: 0,
  rfrLong: 0,
  failureChance: 0,
  overrides: {
    'revenueGrowth': false,
    'salesCap': false,
    'cocLong': false,
    'rocLong': false,
    'taxRateEffectiveLong': false,
    'rfrLong': false,
    'failureChance': false,
  }
}

const companySlice = createSlice({
  name: 'company',
  initialState,
  // initialState:  testCompany,
  reducers: {
    update(state, action) {
      const key = action.payload.key
      const value = action.payload.value

      state[key] = value
    },
    updateAll(_state, action) {
      return action.payload
    },
    reset(_state, _action) {
      return initialState
    }
  }
})

export const { update, updateAll, reset } = companySlice.actions
export default companySlice.reducer
