import { useDispatch, useSelector } from 'react-redux'
import {
  Typography,
  TextField,
  Grid,
  Stack,
  Box
} from '@mui/material'
import { NumericFormat } from 'react-number-format'

import { update } from '../reducers/companyReducer'
import marketData from '../utils/marketData'

const textFieldProps = {
  variant: 'outlined',
  size: 'small'
}

const BetaDirect = () => {
  const dispatch = useDispatch()
  const company = useSelector((state) => state.company)

  const handleChange = (key, value) => {
    dispatch(update({
      key: key,
      value: value
    }))
  }

  return (
    <>
      <Stack
        direction='row'
        spacing={2}
        alignItems='center'
      >
        <Typography
          variant='body1'
        >
          Beta
        </Typography>
        <NumericFormat
          value={company.betaDirect}
          thousandSeparator
          decimalScale={4}
          decimalSeparator="."
          onValueChange={(values) => {
            handleChange('betaDirect', values.floatValue)
          }}
          customInput={TextField}
          {...textFieldProps
          }
          aria-label='Beta Direct Input'
        />
      </Stack>
      <Typography
        variant='body1'
        align='center'
        sx={{ width: 400 }}
      >
        <em>Average Unlevered Beta for {company.industry} is {marketData.industries[company.industry]['Beta']}</em>
      </Typography>
    </>
  )
}

export default BetaDirect
