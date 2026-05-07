import { useDispatch, useSelector } from 'react-redux';
import { Typography, Stack, TextField } from '@mui/material';
import { NumericFormat } from 'react-number-format';

import { update } from '../reducers/companyReducer';

const textFieldProps = {
  variant: 'outlined',
  size: 'small',
  sx: {
    width: 200,
  },
};

const PreferredStock = () => {
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
      <Typography variant="h4">Preferred Stock</Typography>
      <Stack
        spacing={2}
        direction="row"
        sx={{
          width: 500,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            width: 300,
          }}
        >
          Number of Preferred Shares
        </Typography>
        <NumericFormat
          value={company.preferredShares}
          thousandSeparator
          onValueChange={(values) => {
            handleChange('preferredShares', values.floatValue);
          }}
          customInput={TextField}
          {...textFieldProps}
        />
      </Stack>
      <Stack
        spacing={2}
        direction="row"
        sx={{
          width: 500,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            width: 300,
          }}
        >
          Current Market Price per Preferred Share
        </Typography>
        <NumericFormat
          value={company.preferredPrice}
          thousandSeparator
          prefix="$"
          onValueChange={(values) => {
            handleChange('preferredPrice', values.floatValue);
          }}
          customInput={TextField}
          {...textFieldProps}
        />
      </Stack>
      <Stack
        spacing={2}
        direction="row"
        sx={{
          width: 500,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            width: 300,
          }}
        >
          Annual Dividend per Preferred Share
        </Typography>
        <NumericFormat
          value={company.preferredDividend}
          prefix="$"
          thousandSeparator
          onValueChange={(values) => {
            handleChange('preferredDividend', values.floatValue);
          }}
          customInput={TextField}
          {...textFieldProps}
        />
      </Stack>
    </Stack>
  );
};

export default PreferredStock;
