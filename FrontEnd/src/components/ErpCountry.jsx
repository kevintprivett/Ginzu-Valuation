import {
  Typography,
} from '@mui/material'

import marketData from '../utils/marketData'

const ErpCountry = () => {
  return (
    <>
      <Typography
        variant='body1'
      >
        Country of Incorporation: 'United States' ERP: {marketData.countries['United States']['ERP']}%
      </Typography>
    </>
  )
}

export default ErpCountry
