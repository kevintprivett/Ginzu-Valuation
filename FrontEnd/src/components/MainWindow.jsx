import { useState } from 'react'
import { BrowserRouter as Router,
  Routes, Route, Link, Navigate
} from 'react-router-dom'
import {
  Box,
  Tabs,
  Tab,
} from '@mui/material'

import CompanyInfoPanel from './CompanyInfoPanel'
import FinancialsPanel from './FinancialsPanel'
import FutureProjectionsPanel from './FutureProjectionsPanel'
import ValuationOutputPanel from './ValuationOutputPanel'
import CostOfCapitalPanel from './CostOfCapitalPanel'
import MiscPanel from './MiscPanel'
import UtilsPanel from './UtilsPanel'

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      style={{ width: '100%' }}
      {...other}
    >
      {value === index && (
        <>
          {children}
        </>
      )}
    </div>
  )
}

const a11yProps = (index) => {
  return {
    id: `vertical-tab-${index}`
  }
}

const VerticalTabs = () => {
  const [value, setValue] = useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue);
  }

  return (
    <Router>
      <Box
        sx={{ 
          flexGrow: 1,
          bgcolor: 'background.paper',
          display: 'flex',
          minHeight: 400,
          mx: 10,
          py: 4,
          borderRadius: 5
        }}
      >
        <Tabs
          orientation="vertical"
          value={value}
          onChange={handleChange}
          sx={{
            borderRight: 1,
            borderColor: 'divider'
          }}
        >
          <Tab label="Company Info" to='/company' component={Link} {...a11yProps(0)} />
          <Tab label="Financials" to='/financials' component={Link} {...a11yProps(1)} />
          <Tab label="Cost of Capital" to='/cost-of-capital' component={Link} {...a11yProps(2)} />
          <Tab label="Misc: Options, R&D" to='/misc' component={Link} {...a11yProps(3)} />
          <Tab label="Future Projections" to='/future-projections' component={Link} {...a11yProps(4)} />
          <Tab label="Valuation Output" to='/valuation-output' component={Link} {...a11yProps(5)} />
          <Tab label="Utils" to='/utils' component={Link} {...a11yProps(6)} />
        </Tabs>
        <Routes>
          <Route path="*" element={<Navigate to="/company" />} />
          <Route index path="/company" element={
            <TabPanel>
              <CompanyInfoPanel />
            </TabPanel>
          } />
          <Route path="/financials" element={
            <TabPanel value={value} index={1}>
              <FinancialsPanel />
            </TabPanel>
          } />
          <Route path="/cost-of-capital" element={
            <TabPanel value={value} index={2}>
              <CostOfCapitalPanel />
            </TabPanel>
          } />
          <Route path="/misc" element={
            <TabPanel value={value} index={3}>
              <MiscPanel />
            </TabPanel>
          } />
          <Route path="/future-projections" element={
            <TabPanel value={value} index={4}>
              <FutureProjectionsPanel />
            </TabPanel>
          } />
          <Route path="/valuation-output" element={
            <TabPanel value={value} index={5}>
              <ValuationOutputPanel />
            </TabPanel>
          } />
          <Route path="/utils" element={
            <TabPanel value={value} index={6}>
              <UtilsPanel />
            </TabPanel>
          } />
        </Routes>
      </Box>
    </Router>
  )
}

const MainWindow = () => {
  return (
    <>
      <VerticalTabs />
    </>
  )
}

export default MainWindow
