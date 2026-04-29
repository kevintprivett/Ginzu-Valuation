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

const textFieldProps = {
  variant: 'outlined',
  size: 'small',
};

const Row = ({
  index,
  company,
  handleChange,
  removeRow,
  label,
  showRemove,
}) => {
  return (
    <>
      <Grid
        size={2}
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
        size={5}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="body1">{label}</Typography>
      </Grid>
      <Grid size={5}>
        <NumericFormat
          value={company.rdExpenses[index]}
          prefix={'$'}
          suffix={'MM'}
          thousandSeparator
          onValueChange={(values) => {
            handleChange('rdExpenses', index, values.floatValue);
          }}
          customInput={TextField}
          {...textFieldProps}
        />
      </Grid>
    </>
  );
};

const AddRow = ({ addRow }) => {
  return (
    <>
      <Grid
        size={2}
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
      <Grid size={10} />
    </>
  );
};

const RdExpenses = () => {
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

  const handleArrayChange = (key, index, value) => {
    const array = company[key];
    const newArray = array.with(index, value);
    handleChange(key, newArray);
  };

  const addRow = () => {
    const array = company.rdExpenses;
    const newArray = array.concat(0);
    handleChange('rdExpenses', newArray);
  };

  const removeRow = () => {
    const array = company.rdExpenses;
    const newArray = array.slice(0, -1);
    handleChange('rdExpenses', newArray);
  };

  return (
    <>
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
            {company.rdExpenses.map((rdExpense, index) => (
              <Row
                key={`rdExpense${index}`}
                index={index}
                company={company}
                handleChange={handleArrayChange}
                removeRow={removeRow}
                label={
                  index === 0
                    ? 'Current Year Expenses'
                    : `Current Year - ${index}`
                }
                showRemove={index === company.rdExpenses.length - 1}
              />
            ))}
            <AddRow addRow={addRow} />
          </Grid>
        </Box>
      </Stack>
    </>
  );
};

export default RdExpenses;
