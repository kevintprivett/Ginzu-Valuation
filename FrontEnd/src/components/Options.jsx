import { useDispatch, useSelector } from 'react-redux';
import { Typography, Stack, TextField, Link } from '@mui/material';
import { NumericFormat } from 'react-number-format';

import { update } from '../reducers/companyReducer';

const textFieldProps = {
  variant: 'outlined',
  size: 'small',
  sx: {
    minWidth: 200,
  },
};

const Options = () => {
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
      <Stack
        spacing={2}
        direction="row"
        alignItems="center"
        sx={{
          width: 500,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            minWidth: 300,
          }}
        >
          Number of Options Outstanding
        </Typography>
        <NumericFormat
          value={company.optionOutstanding}
          thousandSeparator
          suffix=" million"
          onValueChange={(values) => {
            handleChange('optionOutstanding', values.floatValue);
          }}
          customInput={TextField}
          {...textFieldProps}
        />
      </Stack>
      <Stack
        spacing={2}
        direction="row"
        alignItems="center"
        sx={{
          width: 500,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            minWidth: 300,
          }}
        >
          Average Strike Price
        </Typography>
        <NumericFormat
          value={company.optionStrike}
          thousandSeparator
          prefix="$"
          onValueChange={(values) => {
            handleChange('optionStrike', values.floatValue);
          }}
          customInput={TextField}
          {...textFieldProps}
        />
      </Stack>
      <Stack
        spacing={2}
        direction="row"
        alignItems="center"
        sx={{
          width: 500,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            minWidth: 300,
          }}
        >
          Average Maturity
        </Typography>
        <NumericFormat
          value={company.optionMaturity}
          suffix=" years"
          thousandSeparator
          onValueChange={(values) => {
            handleChange('optionMaturity', values.floatValue);
          }}
          customInput={TextField}
          {...textFieldProps}
        />
      </Stack>
      <Stack
        spacing={2}
        direction="row"
        alignItems="center"
        sx={{
          width: 700,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            minWidth: 300,
          }}
        >
          Implied Volatility of Stock
        </Typography>
        <NumericFormat
          value={company.impliedVol}
          suffix="%"
          thousandSeparator
          onValueChange={(values) => {
            handleChange('impliedVol', values.floatValue);
          }}
          customInput={TextField}
          {...textFieldProps}
        />
        {company.ticker != '' && (
          <Link
            href={`https://finance.yahoo.com/quote/${company.ticker}/options/`}
            target="_blank"
            sx={{
              width: 200,
            }}
          >
            Yahoo Options Search
          </Link>
        )}
      </Stack>
    </Stack>
  );
};

export default Options;
