import { useDispatch, useSelector } from 'react-redux';
import { Typography, TextField, Grid, Stack, Box } from '@mui/material';
import { NumericFormat } from 'react-number-format';

import { update } from '../reducers/companyReducer';
import marketData from '../utils/marketData';

const textFieldProps = {
  variant: 'outlined',
  size: 'small',
};

const CostOfCapitalDirect = () => {
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
    <>
      <br />
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        alignItems="center"
        sx={{ width: 400 }}
      >
        <Typography variant="body1" align="center" sx={{ width: 150 }}>
          Cost of Capital
        </Typography>
        <NumericFormat
          value={company.cocDirect}
          decimalScale={2}
          decimalSeparator="."
          suffix={'%'}
          thousandSeparator
          onValueChange={(values) => {
            handleChange('cocDirect', values.floatValue);
          }}
          customInput={TextField}
          {...textFieldProps}
        />
      </Stack>
      <Typography variant="body1" align="center" sx={{ width: 400 }}>
        <em>
          Cost of Capital for {company.industry} is{' '}
          {marketData.industries[company.industry]['Cost of Capital']}%
        </em>
      </Typography>
    </>
  );
};

export default CostOfCapitalDirect;
