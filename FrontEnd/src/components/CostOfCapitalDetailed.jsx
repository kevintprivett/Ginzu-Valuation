import { Stack, Box } from '@mui/material';

import CostOfEquity from './CostOfEquity';
import CostOfDebt from './CostOfDebt';
import PreferredStock from './PreferredStock';
import CostOfCapitalDetailedOutput from './CostOfCapitalDetailedOutput';

const CostOfCapitalDetailed = () => {
  return (
    <Box
      sx={{
        padding: 2,
      }}
    >
      <Stack spacing={2}>
        <CostOfEquity />
        <CostOfDebt />
        <PreferredStock />
        <CostOfCapitalDetailedOutput />
      </Stack>
    </Box>
  );
};

export default CostOfCapitalDetailed;
