import { useDispatch, useSelector } from 'react-redux'
import {
  Typography,
  Stack,
  Select,
  MenuItem
} from '@mui/material'

import { update } from '../reducers/companyReducer'
import { CocApproaches } from '../utils/Enums'
import CostOfCapitalDirect from './CostOfCapitalDirect'
import CostOfCapitalAverage from './CostOfCapitalAverage'
import CostOfCapitalDetailed from './CostOfCapitalDetailed'

const CostOfCapitalPanel = () => {
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
        justifyContent='center'
        alignItems='center'
        sx={{ width: 400 }}
      >
        <Typography
          variant='body1'
          align='center'
          sx={{ width: 200 }}
        >
          Cost of Capital Approach
        </Typography>
        <Select
          value={company.cocApproach}
          onChange={(event) => handleChange('cocApproach', event.target.value)}
          MenuProps={{
            PaperProps: {
              sx: {
                maxHeight: 400
              }
            }
          }}
          sx={{ width: 200 }}
        >
          {Object.keys(CocApproaches).map(key => {
            return (
              <MenuItem value={CocApproaches[key]}>{CocApproaches[key]}</MenuItem>
            )}
          )}
        </Select>
      </Stack>
      {company.cocApproach === CocApproaches.DIRECT && <CostOfCapitalDirect />}
      {company.cocApproach === CocApproaches.AVERAGE && <CostOfCapitalAverage />}
      {company.cocApproach === CocApproaches.DETAILED && <CostOfCapitalDetailed />}
    </>
  )
}

export default CostOfCapitalPanel
