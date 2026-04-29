import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Typography,
  Stack,
  Box,
  TextField,
  Select,
  MenuItem,
  Link,
  Snackbar,
  Alert
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { DemoContainer } from '@mui/x-date-pickers/internals/demo'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { NumericFormat } from 'react-number-format'
import dayjs from 'dayjs'

import { update, updateTicker } from '../reducers/companyReducer'
import { Industries } from '../utils/Enums'
import tickerMap from '../utils/ticker'
import { getTicker } from '../services/apiService'

const CompanyInfoPanel = () => {
  const dispatch = useDispatch()
  const company = useSelector((state) => state.company)
  const [successToastOpen, setSuccessToastOpen] = useState(false);
  const [errorToastOpen, setErrorToastOpen] = useState(false);

  const textFieldProps = {
    variant: 'outlined',
    sx: [{
      width: 250
    }]
  }

  const handleChange = (key, value) => {
    dispatch(update({
      key: key,
      value: value
    }))
  }

  const handleTickerGet = (ticker) => {
    getTicker(ticker)
      .then((data) => {
        if (data && !Object.hasOwn(data, 'error')) {
          dispatch(updateTicker(data))
          setSuccessToastOpen(true)
        } else {
          setErrorToastOpen(true)
        }
      })
      .catch(() => {
        setErrorToastOpen(true)
      })
  }

  const handleSuccessToastClose = () => {
    setSuccessToastOpen(false)
  }

  const handleErrorToastClose = () => {
    setErrorToastOpen(false)
  }

  const inTickerMap = (ticker) => {
    if (Object.hasOwn(tickerMap, ticker.toLowerCase())) {
      return true
    }
    return false
  }

  return (
    <Box>
      <Stack spacing={2} sx={{
        width: 600,
        alignItems: 'flex-start',
      }} >
        <Stack
          direction='row'
          spacing={2}
          justifyContent='center'
          alignItems='center'
        >
          <Typography
            variant='body1'
            align='center'
            sx={{ width: 150 }}
          >
            Date of Valuation
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DatePicker']}>
              <DatePicker
                size='small'
                value={dayjs(company.date)}
                onChange={(newValue) => handleChange("date", newValue.format('YYYY-MM-DD'))}
              />
            </DemoContainer>
          </LocalizationProvider>
        </Stack>
        <Stack
          direction='row'
          spacing={2}
          justifyContent='center'
          alignItems='center'
        >
          <Typography
            variant='body1'
            align='center'
            sx={{ width: 150 }}
          >
            Company Ticker  
          </Typography>
          <TextField
            variant='outlined'
            value={company.ticker}
            onChange={(event) => handleChange("ticker", event.target.value)}
            sx={{ width: 250 }}
          />
          {inTickerMap(company.ticker) && 
            <Link
              onClick={() => handleTickerGet(company.ticker)}
            >
              Get Company Data
            </Link>
          }
        </Stack>
        <Stack
          direction='row'
          spacing={2}
          justifyContent='center'
          alignItems='center'
        >
          <Typography
            variant='body1'
            align='center'
            sx={{ width: 150 }}
          >
            Company Name
          </Typography>
          <TextField
            variant='outlined'
            value={company.name}
            onChange={(event) => handleChange("name", event.target.value)}
            sx={{ width: 250 }}
          />
        </Stack>
        <Stack
          direction='row'
          spacing={2}
          justifyContent='center'
          alignItems='center'
        >
          <Typography
            variant='body1'
            align='center'
            sx={{ width: 150 }}
          >
            Industry
          </Typography>
          <Select
            value={company.industry}
            onChange={(event) => handleChange('industry', event.target.value)}
            MenuProps={{
              PaperProps: {
               sx: {
                  maxHeight: 400
                }
              }
            }}
            sx={{ width: 250 }}
          >
            {Object.keys(Industries).map(key => {
              return (
                <MenuItem value={Industries[key]}>{Industries[key]}</MenuItem>
              )}
            )}
          </Select>
        </Stack>
        <Stack
          direction='row'
          spacing={2}
          justifyContent='center'
          alignItems='center'
        >
          <Typography
            variant='body1'
            align='center'
            sx={{ width: 150 }}
          >
            Stock Price
          </Typography>
          <NumericFormat
            value={company.stockPrice}
            prefix='$'
            thousandSeparator
            onValueChange={(values) => {
              handleChange('stockPrice', values.floatValue)
            }}
            customInput={TextField}
            {...textFieldProps
            }
          />
          {company.ticker != "" && 
            <Link
              href={`http://www.google.com/search?q=stock+price+${company.ticker}`}
              target="_blank"
            >
              Search
            </Link>
          }
        </Stack>
      </Stack>
      <Snackbar open={successToastOpen} autoHideDuration={6000} onClose={handleSuccessToastClose}>
        <Alert
          onClose={handleSuccessToastClose}
          severity="success"
          variant="filled"
          sx={{ width: '100%', color: 'white'}}
        >
          <Typography variant='body1' >
            Company info retrieved successfully!
          </Typography>
        </Alert>
      </Snackbar>
      <Snackbar open={errorToastOpen} autoHideDuration={6000} onClose={handleErrorToastClose}>
        <Alert
          onClose={handleErrorToastClose}
          severity="warning"
          variant="filled"
          sx={{ width: '100%' }}
        >
          <Typography variant='body1' >
            No company info found!
          </Typography>
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default CompanyInfoPanel
