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
import { Countries } from '../utils/Enums';
import marketData from '../utils/marketData';
import { calculateWeight } from '../utils/financialCalculations';

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
        size={0.5}
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
          value={company.countries[index].country}
          onChange={(event) =>
            handleObjectArrayChange(
              'countries',
              index,
              'country',
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
          {Object.keys(Countries).map((key) => {
            return <MenuItem value={Countries[key]}>{Countries[key]}</MenuItem>;
          })}
        </Select>
      </Grid>
      <Grid size={2}>
        <NumericFormat
          value={company.countries[index].revenue}
          prefix={'$'}
          suffix={'MM'}
          thousandSeparator
          onValueChange={(values) => {
            handleObjectArrayChange(
              'countries',
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
          {marketData.countries[company.countries[index].country]['ERP']}
        </Typography>
      </Grid>
      <Grid size={2}>
        <Typography variant="body1" align="center">
          {calculateWeight(index, company.countries, 'revenue').toFixed(2)}
        </Typography>
      </Grid>
      <Grid size={2}>
        <Typography variant="body1" align="center">
          {(
            marketData.countries[company.countries[index].country]['ERP'] *
            calculateWeight(index, company.countries, 'revenue')
          ).toFixed(2)}
        </Typography>
      </Grid>
    </>
  );
};

const AddRow = ({ addRow }) => {
  return (
    <>
      <Grid
        size={0.5}
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
      <Grid size={11} />
    </>
  );
};

const TitleRow = () => {
  return (
    <>
      <Grid size={0.5} />
      <Grid size={3}>
        <Typography variant="body1" align="center">
          Country
        </Typography>
      </Grid>
      <Grid size={2}>
        <Typography variant="body1" align="center">
          Revenues
        </Typography>
      </Grid>
      <Grid size={2}>
        <Typography variant="body1" align="center">
          ERP
        </Typography>
      </Grid>
      <Grid size={2}>
        <Typography variant="body1" align="center">
          Weight
        </Typography>
      </Grid>
      <Grid size={2}>
        <Typography variant="body1" align="center">
          Weighted ERP
        </Typography>
      </Grid>
    </>
  );
};
const ErpCountries = () => {
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
    const array = company.countries;
    const newObject = {
      country: Countries.BLANK,
      revenue: 0,
    };
    const newArray = array.concat(newObject);
    handleChange('countries', newArray);
  };

  const removeRow = () => {
    const array = company.countries;
    const newArray = array.slice(0, -1);
    handleChange('countries', newArray);
  };

  return (
    <>
      <br />
      <Stack spacing={2}>
        <Box
          sx={{
            flexGrow: 1,
            width: '100%',
          }}
        >
          <Grid
            container
            spacing={2}
            columns={11.5}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TitleRow />
            {company.countries.map((country, index) => (
              <Row
                key={`countryRow${index}`}
                index={index}
                company={company}
                handleObjectArrayChange={handleObjectArrayChange}
                removeRow={removeRow}
                showRemove={index === company.countries.length - 1}
              />
            ))}
            <AddRow addRow={addRow} />
          </Grid>
        </Box>
      </Stack>
    </>
  );
};

export default ErpCountries;
