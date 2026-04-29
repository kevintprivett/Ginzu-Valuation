import { useDispatch, useSelector } from 'react-redux';
import {
  Typography,
  Grid,
  Stack,
  Box,
  TextField,
  Link,
  Select,
  MenuItem,
} from '@mui/material';
import { NumericFormat } from 'react-number-format';

import { update } from '../reducers/companyReducer';

const textFieldProps = {
  variant: 'outlined',
  size: 'small',
};

const SimpleRow = ({ value, label, onChange, prefix, suffix }) => {
  return (
    <>
      <Grid size={4}>
        <Typography variant="body1" align="center">
          {label}
        </Typography>
      </Grid>
      <Grid size={4} align="center">
        <NumericFormat
          value={value}
          prefix={prefix}
          suffix={suffix}
          thousandSeparator
          onValueChange={(values) => {
            onChange(values.floatValue);
          }}
          customInput={TextField}
          {...textFieldProps}
        />
      </Grid>
      <Grid size={4} />
    </>
  );
};

const ObjectRow = ({ object, label, onChange, prefix, suffix }) => {
  return (
    <>
      <Grid size={4}>
        <Typography variant="body1" align="center">
          {label}
        </Typography>
      </Grid>
      <Grid size={4} align="center">
        <NumericFormat
          value={object['Q10']}
          prefix={prefix}
          suffix={suffix}
          thousandSeparator
          onValueChange={(values) => {
            onChange('Q10', values.floatValue);
          }}
          customInput={TextField}
          {...textFieldProps}
        />
      </Grid>
      <Grid size={4} align="center">
        <NumericFormat
          value={object['K10']}
          prefix={prefix}
          suffix={suffix}
          thousandSeparator
          onValueChange={(values) => {
            onChange('K10', values.floatValue);
          }}
          customInput={TextField}
          {...textFieldProps}
        />
      </Grid>
    </>
  );
};

const FinancialsPanel = () => {
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

  const handleObjectChange = (key, value, property) => {
    const object = company[key];
    const newObject = { ...object };
    newObject[property] = value;
    handleChange(key, newObject);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        width: '80%',
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        alignItems="center"
        sx={{ width: 400 }}
      >
        <Typography variant="body1" align="center" sx={{ width: 150 }}>
          Years since last 10K
        </Typography>
        <Select
          value={company.years10k}
          onChange={(event) => handleChange('years10k', event.target.value)}
          MenuProps={{
            PaperProps: {
              sx: {
                maxHeight: 400,
                minWidth: 200,
              },
            },
          }}
          sx={{
            width: 100,
            textAlign: 'center',
          }}
        >
          <MenuItem value={0.25}>0.25</MenuItem>
          <MenuItem value={0.5}>0.5</MenuItem>
          <MenuItem value={0.75}>0.75</MenuItem>
          <MenuItem value={1}>1</MenuItem>
        </Select>
      </Stack>
      <br />
      {company.ticker != '' && (
        <Link
          href={`https://finance.yahoo.com/quote/${company.ticker}/financials/`}
          target="_blank"
          sx={{
            px: 2,
          }}
        >
          Yahoo Finance Search
        </Link>
      )}
      {company.ticker != '' && (
        <Link
          href={`https://www.sec.gov/cgi-bin/browse-edgar?company=${company.name}`}
          target="_blank"
          sx={{
            px: 2,
          }}
        >
          EDGAR Filings Search
        </Link>
      )}
      {company.ticker != '' && <br />}
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Grid size={4}>
          <Typography variant="body1" align="center">
            <br />
          </Typography>
        </Grid>
        <Grid size={4}>
          <Typography variant="body1" align="center">
            TTM
            <br />
            Most Recent Quarter
          </Typography>
        </Grid>
        <Grid size={4}>
          <Typography variant="body1" align="center">
            Most Recent 10K
          </Typography>
        </Grid>
        <ObjectRow
          object={company['revenues']}
          label="Revenues"
          onChange={(property, value) =>
            handleObjectChange('revenues', value, property)
          }
          prefix="$"
          suffix="MM"
        />
        <ObjectRow
          object={company['ebit']}
          label="Operating Income / EBIT"
          onChange={(property, value) =>
            handleObjectChange('ebit', value, property)
          }
          prefix="$"
          suffix="MM"
        />
        <ObjectRow
          object={company['interestExpense']}
          label="Interest Expense"
          onChange={(property, value) =>
            handleObjectChange('interestExpense', value, property)
          }
          prefix="$"
          suffix="MM"
        />
        <ObjectRow
          object={company['equity']}
          label="Book Value of Equity"
          onChange={(property, value) =>
            handleObjectChange('equity', value, property)
          }
          prefix="$"
          suffix="MM"
        />
        <ObjectRow
          object={company['debt']}
          label="Book Value of Debt"
          onChange={(property, value) =>
            handleObjectChange('debt', value, property)
          }
          prefix="$"
          suffix="MM"
        />
        <SimpleRow
          value={company['debtMaturity']}
          label="Average Maturity of Debt"
          onChange={(value) => handleChange('debtMaturity', value)}
          prefix=""
          suffix=" years"
        />
        <ObjectRow
          object={company['cash']}
          label="Cash and Marketable Securities"
          onChange={(property, value) =>
            handleObjectChange('cash', value, property)
          }
          prefix="$"
          suffix="MM"
        />
        <ObjectRow
          object={company['minorityInterests']}
          label="Minority Interests"
          onChange={(property, value) =>
            handleObjectChange('minorityInterests', value, property)
          }
          prefix="$"
          suffix="MM"
        />
        <SimpleRow
          value={company['nol']}
          label="Accumulated Net Operating Loss"
          onChange={(value) => handleChange('nol', value)}
          prefix="$"
          suffix="MM"
        />
        <SimpleRow
          value={company['taxRateMarginal']}
          label="Marginal Tax Rate"
          onChange={(value) => handleChange('taxRateMarginal', value)}
          prefix=""
          suffix="%"
        />
        <SimpleRow
          value={company['taxRateEffective']}
          label="Effective Tax Rate"
          onChange={(value) => handleChange('taxRateEffective', value)}
          prefix=""
          suffix="%"
        />
        <SimpleRow
          value={company['shares']}
          label="Shares Outstanding"
          onChange={(value) => handleChange('shares', value)}
          prefix=""
          suffix=" million"
        />
      </Grid>
      <br />
      <Typography
        variant="h7"
        align="left"
        sx={{
          fontStyle: 'italic',
        }}
      >
        Note: All numbers are in millions unless otherwise specified.
      </Typography>
    </Box>
  );
};

export default FinancialsPanel;
