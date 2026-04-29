import { useDispatch, useSelector } from 'react-redux';
import {
  Typography,
  Stack,
  FormControl,
  RadioGroup,
  Radio,
  FormControlLabel,
  Box,
} from '@mui/material';

import { YesNo } from '../utils/Enums';
import { update } from '../reducers/companyReducer';
import Options from '../components/Options';
import RdExpenses from '../components/RdExpenses';

const MiscPanel = () => {
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
    <Box
      sx={{
        padding: 2,
      }}
    >
      <Stack
        spacing={2}
        sx={{
          width: 500,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography
            variant="body1"
            sx={{
              width: 300,
            }}
          >
            Are There Employee Options Outstanding?
          </Typography>
          <FormControl>
            <RadioGroup
              value={company.hasOptions}
              onChange={(event) =>
                handleChange('hasOptions', event.target.value)
              }
              row
            >
              <FormControlLabel
                value={YesNo.YES}
                control={<Radio />}
                label={YesNo.YES}
              />
              <FormControlLabel
                value={YesNo.NO}
                control={<Radio />}
                label={YesNo.NO}
              />
            </RadioGroup>
          </FormControl>
        </Stack>
        {company.hasOptions === YesNo.YES && <Options />}
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography
            variant="body1"
            sx={{
              width: 300,
            }}
          >
            Are There R&D Expenses?
          </Typography>
          <FormControl>
            <RadioGroup
              value={company.hasRdExpenses}
              onChange={(event) =>
                handleChange('hasRdExpenses', event.target.value)
              }
              row
            >
              <FormControlLabel
                value={YesNo.YES}
                control={<Radio />}
                label={YesNo.YES}
              />
              <FormControlLabel
                value={YesNo.NO}
                control={<Radio />}
                label={YesNo.NO}
              />
            </RadioGroup>
          </FormControl>
        </Stack>
        {company.hasRdExpenses === YesNo.YES && <RdExpenses />}
      </Stack>
    </Box>
  );
};

export default MiscPanel;
