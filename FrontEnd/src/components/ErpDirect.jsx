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

const ErpDirect = () => {
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
          align='center'
        >
          ERP
        </Typography>
        <NumericFormat
          value={company.erpDirect}
          decimalScale={2}
          decimalSeparator="."
          thousandSeparator
          suffix="%"
          onValueChange={(values) => {
            handleChange('erpDirect', values.floatValue)
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
        <em>Equity Risk Premium for U.S. is {marketData.countries["United States"].ERP}%</em>
      </Typography>
    </>
  )
}

export default ErpDirect
