import { useSelector } from 'react-redux'
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'

import { 
  calculateValueOfDebt,
  calculateValueOfPreferred,
  calculateCostOfEquity,
  calculateCostOfDebt,
  calculateCostOfPreferred,
  calculateValueOfEquity,
  calculateCostOfCapital
} from '../utils/financialCalculations'

const CostOfCapitalDetailedOutput = () => {
  const company = useSelector((state) => state.company)

  const marketValue = calculateValueOfEquity(company)
  const debtValue = calculateValueOfDebt(company)
  const preferredValue = calculateValueOfPreferred(company)
  const totalCapital = marketValue + debtValue + preferredValue

  const coe = calculateCostOfEquity(company)
  const cod = calculateCostOfDebt(company)
  const cop = calculateCostOfPreferred(company)

  const coc = calculateCostOfCapital(company)

  return (
    <>
      <Typography variant='h4'>
        Output
      </Typography>
      <TableContainer
        sx={{
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Equity</TableCell>
              <TableCell>Debt</TableCell>
              <TableCell>Preferred Stock</TableCell>
              <TableCell>Total Capital</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Market Value</TableCell>
              <TableCell>${marketValue.toLocaleString('US-en')}MM</TableCell>
              <TableCell>${debtValue.toLocaleString('US-en')}MM</TableCell>
              <TableCell>${preferredValue.toLocaleString('US-en')}MM</TableCell>
              <TableCell>${totalCapital.toLocaleString('US-en')}MM</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Weight in Cost of Capital</TableCell>
              <TableCell>{((marketValue / totalCapital * 100) || 0).toFixed(2)}%</TableCell>
              <TableCell>{((debtValue / totalCapital * 100) || 0).toFixed(2)}%</TableCell>
              <TableCell>{((preferredValue / totalCapital * 100) || 0).toFixed(2)}%</TableCell>
              <TableCell>100%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Cost of Component</TableCell>
              <TableCell>{coe.toFixed(2)}%</TableCell>
              <TableCell>{cod.toFixed(2)}%</TableCell>
              <TableCell>{cop.toFixed(2)}%</TableCell>
              <TableCell>{coc.toFixed(2)}%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}

export default CostOfCapitalDetailedOutput
