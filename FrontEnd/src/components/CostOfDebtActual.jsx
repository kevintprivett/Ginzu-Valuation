import { useDispatch, useSelector } from 'react-redux';
import { Typography, Stack, Box, Select, MenuItem } from '@mui/material';

import { update } from '../reducers/companyReducer';
import { DebtRatings } from '../utils/Enums';

const CostOfDebtActual = () => {
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
        <Typography variant="body1">Company Debt Rating</Typography>
        <Select
          value={company.debtRating}
          onChange={(event) => handleChange('debtRating', event.target.value)}
          MenuProps={{
            PaperProps: {
              sx: {
                maxHeight: 400,
              },
            },
          }}
        >
          {Object.keys(DebtRatings).map((key) => {
            return (
              <MenuItem value={DebtRatings[key]}>{DebtRatings[key]}</MenuItem>
            );
          })}
        </Select>
      </Stack>
    </Stack>
  );
};

export default CostOfDebtActual;
