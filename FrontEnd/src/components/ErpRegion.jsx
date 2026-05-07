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
import { Regions } from '../utils/Enums';
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
          value={company.regions[index].region}
          onChange={(event) =>
            handleObjectArrayChange(
              'regions',
              index,
              'region',
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
          {Object.keys(Regions).map((key) => {
            return <MenuItem value={Regions[key]}>{Regions[key]}</MenuItem>;
          })}
        </Select>
      </Grid>
      <Grid size={2}>
        <NumericFormat
          value={company.regions[index].revenue}
          prefix={'$'}
          suffix={'MM'}
          thousandSeparator
          onValueChange={(values) => {
            handleObjectArrayChange(
              'regions',
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
          {marketData.regions[company.regions[index].region]['ERP'].toFixed(2)}
        </Typography>
      </Grid>
      <Grid size={2}>
        <Typography variant="body1" align="center">
          {calculateWeight(index, company.regions, 'revenue').toFixed(2)}
        </Typography>
      </Grid>
      <Grid size={2}>
        <Typography variant="body1" align="center">
          {(
            marketData.regions[company.regions[index].region]['ERP'] *
            calculateWeight(index, company.regions, 'revenue')
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
          Region
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
const ErpRegion = () => {
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
    const array = company.regions;
    const newObject = {
      region: Regions.BLANK,
      revenue: 0,
    };
    const newArray = array.concat(newObject);
    handleChange('regions', newArray);
  };

  const removeRow = () => {
    const array = company.regions;
    const newArray = array.slice(0, -1);
    handleChange('regions', newArray);
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
            columns={12}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TitleRow />
            {company.regions.map((business, index) => (
              <Row
                key={`regionRow${index}`}
                index={index}
                company={company}
                handleObjectArrayChange={handleObjectArrayChange}
                removeRow={removeRow}
                showRemove={index === company.regions.length - 1}
              />
            ))}
            <AddRow addRow={addRow} />
          </Grid>
        </Box>
      </Stack>
    </>
  );
};

export default ErpRegion;
