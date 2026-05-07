import { useDispatch, useSelector } from 'react-redux';
import {
  Typography,
  TextField,
  Grid,
  Stack,
  Box,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { NumericFormat } from 'react-number-format';

import { update } from '../reducers/companyReducer';
import { Industries } from '../utils/Enums';
import marketData from '../utils/marketData';
import { calculateCostOfCapital } from '../utils/financialCalculations';

const textFieldProps = {
  variant: 'outlined',
  size: 'small',
};

const Row = ({
  index,
  company,
  handleObjectArrayChange,
  removeRow,
  showRemove,
}) => {
  return (
    <>
      <Grid
        size={1}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {showRemove && (
          <IconButton onClick={() => removeRow()}>
            <RemoveCircleOutlineIcon />
          </IconButton>
        )}
      </Grid>
      <Grid
        size={3}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Select
          value={company.businesses[index].business}
          onChange={(event) =>
            handleObjectArrayChange(
              'businesses',
              index,
              'business',
              event.target.value
            )
          }
          MenuProps={{
            PaperProps: {
              sx: {
                maxHeight: 400,
              },
            },
          }}
        >
          {Object.keys(Industries).map((key) => {
            return (
              <MenuItem value={Industries[key]}>{Industries[key]}</MenuItem>
            );
          })}
        </Select>
      </Grid>
      <Grid size={2}>
        <NumericFormat
          value={company.businesses[index].revenue}
          prefix={'$'}
          suffix={'MM'}
          thousandSeparator
          onValueChange={(values) => {
            handleObjectArrayChange(
              'businesses',
              index,
              'revenue',
              values.floatValue
            );
          }}
          customInput={TextField}
          {...textFieldProps}
        />
      </Grid>
      <Grid size={2}>
        <Typography variant="body1" align="center">
          {
            marketData.industries[company.businesses[index].business][
              'EV/Sales'
            ]
          }
        </Typography>
      </Grid>
      <Grid size={2}>
        <Typography variant="body1" align="center">
          {`$${(marketData.industries[company.businesses[index].business]['EV/Sales'] * company.businesses[index].revenue).toLocaleString('en-US', { maximumFractionDigits: 2 })}MM`}
        </Typography>
      </Grid>
      <Grid size={2}>
        <Typography variant="body1" align="center">
          {`${marketData.industries[company.businesses[index].business]['Cost of Capital']}%`}
        </Typography>
      </Grid>
    </>
  );
};

const AddRow = ({ addRow }) => {
  return (
    <>
      <Grid
        size={1}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <IconButton onClick={addRow}>
          <AddCircleOutlineIcon />
        </IconButton>
      </Grid>
      <Grid size={3} />
      <Grid size={8} />
    </>
  );
};

const TitleRow = () => {
  return (
    <>
      <Grid size={1} />
      <Grid size={3}>
        <Typography variant="body1" align="center">
          Business
        </Typography>
      </Grid>
      <Grid size={2}>
        <Typography variant="body1" align="center">
          Revenues
        </Typography>
      </Grid>
      <Grid size={2}>
        <Typography variant="body1" align="center">
          EV/Sales
        </Typography>
      </Grid>
      <Grid size={2}>
        <Typography variant="body1" align="center">
          Estimated Value
        </Typography>
      </Grid>
      <Grid size={2}>
        <Typography variant="body1" align="center">
          Cost of Capital
        </Typography>
      </Grid>
    </>
  );
};
const CostOfCapitalAverage = () => {
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

  const handleObjectArrayChange = (key, index, property, value) => {
    const array = company[key];
    const object = array[index];
    const newObject = { ...object };
    newObject[property] = value;
    const newArray = array.with(index, newObject);
    handleChange(key, newArray);
  };

  const addRow = () => {
    const array = company.businesses;
    const newObject = {
      business: Industries.BLANK,
      revenue: 0,
    };
    const newArray = array.concat(newObject);
    handleChange('businesses', newArray);
  };

  const removeRow = () => {
    const array = company.businesses;
    const newArray = array.slice(0, -1);
    handleChange('businesses', newArray);
  };

  return (
    <>
      <br />
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} sx={{ width: 400 }}>
          <Typography variant="body1" align="center" sx={{ width: 150 }}>
            Cost of Capital:
          </Typography>
          <Typography variant="body1" sx={{ width: 250 }}>
            {`${calculateCostOfCapital(company).toFixed(2)}%`}
          </Typography>
        </Stack>
        <Box
          sx={{
            flexGrow: 1,
            width: '100%',
          }}
        >
          <Grid
            container
            spacing={2}
            columns={12}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TitleRow />
            {company.businesses.map((business, index) => (
              <Row
                key={`businessRow${index}`}
                index={index}
                company={company}
                handleObjectArrayChange={handleObjectArrayChange}
                removeRow={removeRow}
                showRemove={index === company.businesses.length - 1}
              />
            ))}
            <AddRow addRow={addRow} />
          </Grid>
        </Box>
      </Stack>
    </>
  );
};

export default CostOfCapitalAverage;
