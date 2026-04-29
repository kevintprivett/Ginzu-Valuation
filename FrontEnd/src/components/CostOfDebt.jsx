import { useDispatch, useSelector } from 'react-redux';
import { Typography, Stack, Box, Select, MenuItem } from '@mui/material';

import { update } from '../reducers/companyReducer';
import { CodApproaches } from '../utils/Enums';
import { calculateValueOfDebt } from '../utils/financialCalculations';
import CostOfDebtDirect from './CostOfDebtDirect';
import CostOfDebtSynthetic from './CostOfDebtSynthetic';
import CostOfDebtActual from './CostOfDebtActual';

const CostOfDebt = () => {
  const dispatch = useDispatch();
  const company = useSelector((state) => state.company);

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
      <Typography variant="h4">Debt</Typography>
      <Stack spacing={2} direction="row">
        <Typography variant="body1">
          Book Value of Debt: $
          {company.debt['Q10'].toLocaleString('US-en', {
            maximumFractionDigits: 2,
          })}
          MM
        </Typography>
        <Typography variant="body1">
          Interest Expense on Debt: ${company.interestExpense['Q10']}MM
        </Typography>
        <Typography variant="body1">
          Average Maturity: {company.debtMaturity} years
        </Typography>
        <Typography variant="body1">
          Estimated Value of Debt: $
          {calculateValueOfDebt(company).toLocaleString('US-en', {
            maximumFractionDigits: 2,
          })}
          MM
        </Typography>
      </Stack>
      <Stack spacing={2} direction="row" alignItems="center">
        <Typography variant="body1">Cost of Debt Approach</Typography>
        <Select
          value={company.codApproach}
          onChange={(event) => handleChange('codApproach', event.target.value)}
          MenuProps={{
            PaperProps: {
              sx: {
                maxHeight: 400,
              },
            },
          }}
        >
          {Object.keys(CodApproaches).map((key) => {
            return (
              <MenuItem value={CodApproaches[key]}>
                {CodApproaches[key]}
              </MenuItem>
            );
          })}
        </Select>
      </Stack>
      {company.codApproach === CodApproaches.DIRECT && <CostOfDebtDirect />}
      {company.codApproach === CodApproaches.SYNTHETIC && (
        <CostOfDebtSynthetic />
      )}
      {company.codApproach === CodApproaches.ACTUAL && <CostOfDebtActual />}
    </Stack>
  );
};

export default CostOfDebt;
