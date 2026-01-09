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

const CostOfDebtDirect = () => {
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
          Cost of Debt
        </Typography>
        <NumericFormat
          value={company.codDirect}
          decimalScale={4}
          decimalSeparator="."
          suffix="%"
          thousandSeparator
          onValueChange={(values) => {
            handleChange('codDirect', values.floatValue)
          }}
          customInput={TextField}
          {...textFieldProps
          }
        />
      </Stack>
      <Typography
        variant='body1'
        align='center'
        sx={{ width: 400 }}
      >
        <em>Average Cost of Debt for {company.industry} is {marketData.industries[company.industry]['Cost of Debt']}%</em>
      </Typography>
    </>
  )
}

export default CostOfDebtDirect
