import { useDispatch, useSelector } from 'react-redux';
import { Typography, Stack, Box, Select, MenuItem } from '@mui/material';

import { update } from '../reducers/companyReducer';
import { BetaApproaches, ErpApproaches } from '../utils/Enums';
import { rfrApi } from '../services/apiService';
import BetaDirect from './BetaDirect';
import BetaSingle from './BetaSingle';
import BetaMulti from './BetaMulti';
import ErpDirect from './ErpDirect';
import ErpCountry from './ErpCountry';
import ErpCountries from './ErpCountries';
import ErpRegion from './ErpRegion';

const CostOfEquity = () => {
  const dispatch = useDispatch();
  const company = useSelector((state) => state.company);

  const { data: rfrData, isLoading } = rfrApi.endpoints.getRfr.useQuery();

  const rfr = isLoading ? 0 : rfrData;

  const handleChange = (key, value) => {
    dispatch(
      update({
        key: key,
        value: value,
      })
    );
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Equity</Typography>
      <Stack spacing={2} direction="row">
        <Typography variant="body1">
          Shares Outstanding: {company.shares.toLocaleString('en-US')} million
        </Typography>
        <Typography variant="body1">
          Current Stock Price: ${company.stockPrice.toFixed(2)}
        </Typography>
        <Typography variant="body1">Riskfree Rate: {rfr}%</Typography>
      </Stack>
      <Stack spacing={2} direction="row" alignItems="center">
        <Typography variant="body1">Beta Approach</Typography>
        <Select
          value={company.betaApproach}
          onChange={(event) => handleChange('betaApproach', event.target.value)}
          MenuProps={{
            PaperProps: {
              sx: {
                maxHeight: 400,
              },
            },
          }}
        >
          {Object.keys(BetaApproaches).map((key) => {
            return (
              <MenuItem value={BetaApproaches[key]}>
                {BetaApproaches[key]}
              </MenuItem>
            );
          })}
        </Select>
      </Stack>
      {company.betaApproach === BetaApproaches.DIRECT && <BetaDirect />}
      {company.betaApproach === BetaApproaches.SINGLE && <BetaSingle />}
      {company.betaApproach === BetaApproaches.MULTI && <BetaMulti />}
      <Stack spacing={2} direction="row" alignItems="center">
        <Typography variant="body1">ERP Approach</Typography>
        <Select
          value={company.erpApproach}
          onChange={(event) => handleChange('erpApproach', event.target.value)}
          MenuProps={{
            PaperProps: {
              sx: {
                maxHeight: 400,
              },
            },
          }}
        >
          {Object.keys(ErpApproaches).map((key) => {
            return (
              <MenuItem value={ErpApproaches[key]}>
                {ErpApproaches[key]}
              </MenuItem>
            );
          })}
        </Select>
      </Stack>
      {company.erpApproach === ErpApproaches.DIRECT && <ErpDirect />}
      {company.erpApproach === ErpApproaches.COUNTRY && <ErpCountry />}
      {company.erpApproach === ErpApproaches.COUNTRIES && <ErpCountries />}
      {company.erpApproach === ErpApproaches.REGIONS && <ErpRegion />}
    </Stack>
  );
};

export default CostOfEquity;
