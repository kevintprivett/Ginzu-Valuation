import { useSelector } from 'react-redux';
import { Typography, TextField, Grid, Stack, Box } from '@mui/material';

import marketData from '../utils/marketData';

const BetaSingle = () => {
  const company = useSelector((state) => state.company);

  return (
    <>
      <Typography variant="body1">
        <em>
          Industry: {company.industry} Beta:{' '}
          {marketData.industries[company.industry]['Beta']}
        </em>
      </Typography>
    </>
  );
};

export default BetaSingle;
