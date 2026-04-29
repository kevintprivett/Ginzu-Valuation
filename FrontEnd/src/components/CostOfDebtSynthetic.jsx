import { useDispatch, useSelector } from 'react-redux';
import { Typography, Stack, Box, Select, MenuItem } from '@mui/material';

import { update } from '../reducers/companyReducer';
import { CodCompanyTypes } from '../utils/Enums';
import { calculateSyntheticRating } from '../utils/financialCalculations';

const CostOfDebtSynthetic = () => {
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
      <Stack spacing={2} direction="row" alignItems="center">
        <Typography variant="body1">Company Type</Typography>
        <Select
          value={company.codCompanyType}
          onChange={(event) =>
            handleChange('codCompanyType', event.target.value)
          }
          MenuProps={{
            PaperProps: {
              sx: {
                maxHeight: 400,
              },
            },
          }}
        >
          {Object.keys(CodCompanyTypes).map((key) => {
            return (
              <MenuItem value={CodCompanyTypes[key]}>
                {CodCompanyTypes[key]}
              </MenuItem>
            );
          })}
        </Select>
      </Stack>
      <Typography variant="body1">
        Synthetic Rating: {calculateSyntheticRating(company)}
      </Typography>
    </Stack>
  );
};

export default CostOfDebtSynthetic;
