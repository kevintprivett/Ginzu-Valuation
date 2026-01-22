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
        <em>Country of Incorporation: United States ERP: {marketData.countries['United States']['ERP']}%</em>
      </Typography>
    </>
  )
}

export default ErpCountry
