import { useDispatch, useSelector } from 'react-redux'
import {
  Stack,
  Button
} from '@mui/material'

import { updateAll, reset } from '../reducers/companyReducer'

const UtilsPanel = () => {
  const dispatch = useDispatch()
  const company = useSelector((state) => state.company)

  const exportCompany = () => {
    return "data:text/json;charset=utf-8," +
           encodeURIComponent(JSON.stringify(company))
  }

  const importCompany = (event) => {
    const fileReader = new FileReader()
    fileReader.onload = (e) => {
      const content = e.target.result
      const importedData = JSON.parse(content)
      dispatch(updateAll(importedData))
    }
    fileReader.readAsText(event.target.files[0])
  }

  const resetCompany = () => {
    dispatch(reset())
  }

  return (
    <>
      <Stack
        spacing={2}
        sx={{
          px: 2,
          width: 250
        }}
      >
        <Button variant="outlined" href={exportCompany()} download="company_data.json">
          Export Company Data
        </Button>
        <Button variant = "outlined" component="label">
          Import Company Data
          <input
            type="file"
            accept=".json"
            hidden
            onChange={importCompany}
          />
        </Button>
        <Button variant="outlined" onClick={() => resetCompany()}>
          Reset Company Data
        </Button>
      </Stack>
    </>
  )
}

export default UtilsPanel