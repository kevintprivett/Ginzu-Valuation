import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Typography,
  Grid,
  Stack,
  Box,
  TextField,
  Select,
  MenuItem,
  Checkbox
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { NumericFormat } from 'react-number-format'
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Label,
  ReferenceLine
} from 'recharts'

import { update } from '../reducers/companyReducer'
import {
  calculateRevenueGrowthRate,
  calculateLongRevenueGrowthRate,
  calculateOperatingMargin,
  calculateSalesCapRatio,
  calculateCostOfCapital,
  calculateCostOfCapitalLong,
  calculateReturnOnCapital, 
  calculateReturnOnCapitalLong,
  calculateRiskFreeRateLong,
  projectRevenueGrowthRate,
  projectOperatingMargin,
  projectSalesCap,
  projectCoc,
  projectRevenue,
  projectEbit,
  projectNol,
  projectTaxRate,
  projectTaxExpense,
  projectReinvestmentExpense,
  projectInvestedCapital,
  projectRoic,
} from '../utils/financialCalculations'
import marketData from '../utils/marketData'
import { rfrApi } from '../services/apiService'

const textFieldProps = {
  variant: 'outlined',
  size: 'small'
}

const textFieldDisabledProps = {
  variant: 'outlined',
  size: 'small',
  disabled: true
}

const SimpleRow = ({ value,
                     override,
                     label,
                     currentYear,
                     defaultLongValue,
                     handleValueChange,
                     handleOverrideChange,
                     handleClick,
                     prefix,
                     suffix
}) => {
  return (
    <>
      <Grid
        size={2}
        onClick={() => {handleClick(label)}}
      >
        <Typography
          variant='body1'
          align='center'
        >
          {label}
        </Typography>
      </Grid>
      <Grid
        size={2}
        onClick={() => {handleClick(label)}}
      >
        <Typography
          variant='body1'
          align='center'
        >
          {currentYear}
        </Typography>
      </Grid>
      <Grid
        size={4}
        onFocus={() => {handleClick(label)}}
      />
      <Grid
        size={2}
        onFocus={() => {handleClick(label)}}
      >
        <NumericFormat
          value={(override === null || override === true) ?
                 value : 
                 defaultLongValue
                }
          prefix={prefix}
          suffix={suffix}
          thousandSeparator
          onValueChange={(values) => {
            handleValueChange(values.floatValue)
          }}
          customInput={TextField}
          {...((!override || override === true) && textFieldProps)}
          {...(override === false && textFieldDisabledProps)}
        />
      </Grid>
      <Grid
        size={1}
        onFocus={() => {handleClick(label)}}
      >
        <Checkbox
          checked={override}
          onChange={(event) => handleOverrideChange(event.target.checked)}
        />
      </Grid>
    </>
  )
}

const ObjectRow = ({ object,
                     override,
                     label,
                     currentYear,
                     defaultLongValue,
                     handleValueChange,
                     handleOverrideChange,
                     handleClick,
                     prefix,
                     suffix
}) => {
  return (
    <>
      <Grid
        size={2}
        onClick={() => {handleClick(label)}}
      >
        <Typography
          variant='body1'
          align='center'
        >
          {label}
        </Typography>
      </Grid>
      <Grid
        size={2}
        onClick={() => {handleClick(label)}}
      >
        <Typography
          variant='body1'
          align='center'
        >
          {currentYear}
        </Typography>
      </Grid>
      <Grid
        size={2}
        onFocus={() => {handleClick(label)}}
      >
        <NumericFormat
          value={object['next']}
          prefix={prefix}
          suffix={suffix}
          thousandSeparator
          onValueChange={(values) => {
            handleValueChange('next', values.floatValue)
          }}
          customInput={TextField}
          {...textFieldProps
          }
        />
      </Grid>
      <Grid
        size={2}
        onFocus={() => {handleClick(label)}}
      >
        <NumericFormat
          value={object['mid']}
          prefix={prefix}
          suffix={suffix}
          thousandSeparator
          onValueChange={(values) => {
            handleValueChange('mid', values.floatValue)
          }}
          customInput={TextField}
          {...textFieldProps
          }
        />
      </Grid>
      <Grid
        size={2}
        onFocus={() => {handleClick(label)}}
      >
        <NumericFormat
          value={(override === null || override === true) ?
                 object['long'] : 
                 defaultLongValue
                }
          prefix={prefix}
          suffix={suffix}
          thousandSeparator
          onValueChange={(values) => {
            handleValueChange('long', values.floatValue)
          }}
          customInput={TextField}
          {...((!override || override === true) && textFieldProps)}
          {...(override === false && textFieldDisabledProps)}
        />
      </Grid>
      <Grid
        size={1}
        onFocus={() => {handleClick(label)}}
      >
        {override !== null &&
          <Checkbox
            checked={override}
            onChange={(event) => handleOverrideChange(event.target.checked)}
          />
        }
      </Grid>
    </>
  )
}

const TitleRow = () => {
  return (
    <>
      <Grid size={2} />
      <Grid size={2}>
        <Typography
          variant='body1'
          align='center'
        >
          Current Year
        </Typography>
      </Grid>
      <Grid size={2}>
        <Typography
          variant='body1'
          align='center'
        >
          Next Year
        </Typography>
      </Grid>
      <Grid size={2}>
        <Typography
          variant='body1'
          align='center'
        >
          Years 2-5
        </Typography>
      </Grid>
      <Grid size={2}>
        <Typography
          variant='body1'
          align='center'
        >
          Long Term (Years 10+)
        </Typography>
      </Grid>
      <Grid size={1}>
        <Typography
          variant='body1'
          align='center'
        >
          Override?
        </Typography>
      </Grid>
    </>
  )
}

const ProjectionChart = ({company, label}) => {
  const theme = useTheme();

  const primaryColor = theme.palette.primary.main

  let inputData
  let industryAverage = marketData.industries[company.industry]
  let unit = '%'
  switch (label) {
    case 'Revenue Growth Rate':
      inputData = projectRevenueGrowthRate(company)
      inputData = inputData.slice(0, inputData.length - 1)
      industryAverage = industryAverage['Revenue Growth Rate']
      break
    case 'Operating Margin':
      inputData = projectOperatingMargin(company)
      inputData = inputData.slice(0, inputData.length - 1)
      industryAverage = industryAverage['Operating Margin']
      break
    case 'Sales to Capital Ratio':
      inputData = projectSalesCap(company)
      inputData = inputData.slice(0, inputData.length - 1)
      industryAverage = industryAverage['Sales Cap Ratio']
      unit = ''
      break
    case 'Cost of Capital':
      inputData = projectCoc(company)
      inputData = inputData.slice(0, inputData.length - 1)
      industryAverage = industryAverage['Cost of Capital']
      break
    case 'Return on Capital': {
      const projectedRevenueGrowthRate = projectRevenueGrowthRate(company)
      const projectedRevenue = projectRevenue(company, projectedRevenueGrowthRate)
      const projectedOperatingMargin = projectOperatingMargin(company)
      const projectedEbit = projectEbit(
        company,
        projectedRevenue,
        projectedOperatingMargin
      )
      const projectedNol = projectNol(company, projectedEbit)
      const projectedTaxRate = projectTaxRate(company)
      const projectedTaxExpense = projectTaxExpense(
        projectedEbit,
        projectedTaxRate,
        projectedNol
      )
      const projectedReinvestmentExpense = projectReinvestmentExpense(
        company,
        projectedRevenueGrowthRate,
        projectedRevenue,
        projectedEbit,
        projectedTaxExpense,
      )
      const projectedInvestedCapital = projectInvestedCapital(
        company,
        projectedReinvestmentExpense
      )
      inputData = projectRoic(
        company,
        projectedInvestedCapital,
        projectedEbit,
        projectedTaxExpense
      )
      inputData = inputData.slice(0, inputData.length - 1)
      industryAverage = industryAverage['ROIC']
      break
    }
    case 'Effective Tax Rate':
      inputData = projectTaxRate(company)
      inputData = inputData.slice(0, inputData.length - 1)
      industryAverage = industryAverage['Tax Rate']
      break
    default:
      inputData = []
  }

  if (inputData.length === 0) {
    return (
      <>
      </>
    )
  }
  
  let data = []

  inputData.forEach((elem, index) => {
    data.push({'x': index, 'y': elem})
  })
            //dataMin => (Math.min(Math.floor(dataMin), Math.floor(industryAverage))),

  return (
    <LineChart
      width={600}
      height={300}
      margin={{
        top: 10,
        bottom: 10,
        right: 5,
        left: 5
      }}
      data={data}
    >
      <CartesianGrid stroke={primaryColor} strokeDasharray="4 8"/>
      <Line dataKey='y' stroke='#5C946E' strokeWidth={2} />
      <XAxis
        dataKey='x'
        stroke={primaryColor}
        label={{
          value: 'Year',
          position: {
            x: '50%',
            y: 40
          },
          fill: primaryColor
        }}
      />
      <YAxis
        stroke={primaryColor}
        padding={{ top: 20, bottom: 20 }}
        unit={unit}
        domain={
          [
            0,
            dataMax => (Math.max(Math.ceil(dataMax), Math.ceil(industryAverage)))
          ]
        }
        label={{
          value: label,
          angle: -90,
          position: {
            x: 15,
            y: 40
          },
          fill: primaryColor
        }}
      />
      <ReferenceLine
        y={industryAverage}
        label={{ value: 'Industry Average', fill: primaryColor, position: 'top'}}
        stroke="red"
        strokeDasharray="8 4"
      />
    </LineChart>
  )
}

const FutureProjectionsPanel = () => {
  const dispatch = useDispatch()
  const company = useSelector((state) => state.company)
  const [chartSelect, setChartSelect] = useState("")

  const {data: rfr } = rfrApi.endpoints.getRfr.useQuery()

  const handleChange = (key, value) => {
    dispatch(update({
      key: key,
      value: value
    }))
  }

  const handleObjectChange = (key, value, property) => {
    const object = company[key]
    const newObject = {...object}
    newObject[property] = value
    handleChange(key, newObject)
  }

  const handleClick = (label) => {
    setChartSelect(label)
  }

  return (
    <Box 
      sx={{ 
        flexGrow: 1,
        width: '100%'
      }}
    >
      <Grid
        container
        spacing={2}
        columns={11}
        justifyContent='center'
        textAlign='center'
        sx={{
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <TitleRow />
        <ObjectRow
          object={company.revenueGrowth}
          override={company.overrides.revenueGrowth}
          label='Revenue Growth Rate'
          currentYear={`${calculateRevenueGrowthRate(company).toFixed(2)}%`}
          defaultLongValue={calculateLongRevenueGrowthRate(company)}
          handleValueChange={(property, value) => handleObjectChange('revenueGrowth', value, property)} 
          handleOverrideChange={(value) => handleObjectChange('overrides', value, 'revenueGrowth')}
          handleClick={handleClick}
          prefix=''
          suffix='%'
        />
        <ObjectRow
          object={company.operatingMargin}
          override={null}
          label='Operating Margin'
          currentYear={`${calculateOperatingMargin(company).toFixed(2)}%`}
          handleValueChange={(property, value) => handleObjectChange('operatingMargin', value, property)} 
          handleOverrideChange={null}
          handleClick={handleClick}
          prefix=''
          suffix='%'
        />
        <ObjectRow
          object={company.salesCap}
          override={null}
          label='Sales to Capital Ratio'
          currentYear={`${calculateSalesCapRatio(company).toFixed(2)}`}
          handleValueChange={(property, value) => handleObjectChange('salesCap', value, property)} 
          handleOverrideChange={(value) => handleObjectChange('overrides', value, 'salesCap')}
          handleClick={handleClick}
          prefix=''
          suffix=''
        />
        <SimpleRow
          value={company.cocLong}
          override={company.overrides.cocLong}
          label='Cost of Capital'
          currentYear={`${calculateCostOfCapital(company).toFixed(2)}%`}
          defaultLongValue={calculateCostOfCapitalLong(company)}
          handleValueChange={(value) => handleChange('cocLong', value)}
          handleOverrideChange={(value) => handleObjectChange('overrides', value, 'cocLong')}
          handleClick={handleClick}
          prefix=''
          suffix='%'
        />
        <SimpleRow
          value={company.rocLong}
          override={company.overrides.rocLong}
          label='Return on Capital'
          currentYear={`${calculateReturnOnCapital(company).toFixed(2)}%`}
          defaultLongValue={calculateReturnOnCapitalLong(company)}
          handleValueChange={(value) => handleChange('rocLong', value)}
          handleOverrideChange={(value) => handleObjectChange('overrides', value, 'rocLong')}
          handleClick={handleClick}
          prefix=''
          suffix='%'
        />
        <SimpleRow
          value={company.taxRateEffectiveLong}
          override={company.overrides.taxRateEffectiveLong}
          label='Effective Tax Rate'
          currentYear={`${company.taxRateEffective.toFixed(2)}%`}
          defaultLongValue={marketData.taxRate}
          handleValueChange={(value) => handleChange('taxRateEffectiveLong', value)}
          handleOverrideChange={(value) => handleObjectChange('overrides', value, 'taxRateEffectiveLong')}
          handleClick={handleClick}
          prefix=''
          suffix='%'
        />
        <SimpleRow
          value={company.rfrLong}
          override={company.overrides.rfrLong}
          label='Risk Free Rate'
          currentYear={`${rfr.toFixed(2)}%`}
          defaultLongValue={calculateRiskFreeRateLong(company)}
          handleValueChange={(value) => handleChange('rfrLong', value)}
          handleOverrideChange={(value) => handleObjectChange('overrides', value, 'rfrLong')}
          handleClick={handleClick}
          prefix=''
          suffix='%'
        />
        <SimpleRow
          value={company.failureChance}
          override={company.overrides.failureChance}
          label='Chance of Failure'
          currentYear=''
          defaultLongValue={0}
          handleValueChange={(value) => handleChange('failureChance', value)}
          handleOverrideChange={(value) => handleObjectChange('overrides', value, 'failureChance')}
          handleClick={handleClick}
          prefix=''
          suffix='%'
        />
      </Grid>
      <ProjectionChart company={company} label={chartSelect}/>
    </Box>
  )
}

export default FutureProjectionsPanel
