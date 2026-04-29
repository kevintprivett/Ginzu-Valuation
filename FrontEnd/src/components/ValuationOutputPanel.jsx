import { useSelector } from 'react-redux';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Box,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Label,
  ReferenceLine,
} from 'recharts';

import {
  projectRevenueGrowthRate,
  projectRevenue,
  projectOperatingMargin,
  projectEbit,
  projectTaxRate,
  projectTaxExpense,
  projectReinvestmentExpense,
  projectRoic,
  projectInvestedCapital,
  projectSalesCap,
  projectFcff,
  projectNol,
  projectCoc,
  projectDiscountFactor,
  projectPvFcff,
  calculateTerminalValue,
  calculatePvTerminalValue,
  calculatePvCf,
  calculateValueOfOptions,
} from '../utils/financialCalculations';

const SmallTableCell = (props) => (
  <TableCell
    size="small"
    padding="none"
    sx={{
      fontSize: '0.75rem',
      py: 1,
    }}
  >
    {props.children}
  </TableCell>
);

const PopulatedTableRow = ({ data, label, prefix, suffix, wrapper }) => (
  <TableRow>
    <SmallTableCell>{label}</SmallTableCell>
    {data.map((item, idx) =>
      isNaN(item) ? (
        <SmallTableCell key={`${label}${idx}`} />
      ) : (
        <SmallTableCell
          key={`${label}${idx}`}
        >{`${prefix}${wrapper(item)}${suffix}`}</SmallTableCell>
      )
    )}
  </TableRow>
);

const ValuationBarChart = ({
  pvTerminalValue,
  pvCf,
  failureChance,
  failureProceeds,
  debt,
  minorityInterests,
  cash,
  valueOfOptions,
  valueOfEquityCommon,
}) => {
  const theme = useTheme();

  const primaryColor = theme.palette.primary.main;

  const failureValue =
    (failureChance * (failureProceeds - (pvTerminalValue + pvCf))) / 100;

  const data = [
    { name: 'PV(TV)', value: pvTerminalValue },
    { name: 'PV(CF)', value: pvCf },
    { name: 'Failure', value: failureValue },
    { name: 'Debt', value: -debt },
    { name: 'Minority', value: -minorityInterests },
    { name: 'Cash', value: cash },
    { name: 'Options', value: -valueOfOptions },
    { name: 'Total Value', value: valueOfEquityCommon },
  ];

  return (
    <BarChart
      width={600}
      height={400}
      margin={{
        top: 20,
        bottom: 10,
        right: 5,
        left: 50,
      }}
      data={data}
    >
      <Bar dataKey="value">
        {data.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={entry.value < 0 ? 'red' : 'green'}
          />
        ))}
      </Bar>
      <XAxis
        dataKey="name"
        stroke={primaryColor}
        angle={90}
        height={100}
        dx={6}
        dy={50}
        padding="gap"
        label={{
          value: 'Valuation Component',
          position: 'insideBottom',
          fill: primaryColor,
          dy: 10,
        }}
      />
      <YAxis
        stroke={primaryColor}
        padding={{ top: 20, bottom: 20 }}
        label={{
          value: 'Value in $MM',
          position: {
            x: 55,
            y: -5,
          },
          fill: primaryColor,
        }}
      />
      <ReferenceLine y={0} stroke={primaryColor} strokeWidth={1} />
    </BarChart>
  );
};

const CashFlowLineChart = ({
  projectedRevenue,
  projectedEbit,
  projectedFcff,
}) => {
  const theme = useTheme();

  const primaryColor = theme.palette.primary.main;

  let data = [];
  for (let i = 1; i < projectedRevenue.length - 1; ++i) {
    data.push({
      name: `+${i}`,
      revenue: projectedRevenue[i],
      ebit: projectedEbit[i],
      fcff: projectedFcff[i],
    });
  }

  data.push({
    name: 'Term',
    revenue: projectedRevenue[11],
    ebit: projectedEbit[11],
    fcff: projectedFcff[11],
  });

  return (
    <LineChart
      width={600}
      height={400}
      margin={{
        top: 20,
        bottom: 20,
        right: 5,
        left: 50,
      }}
      data={data}
    >
      <Line dataKey="revenue" fill="green" stroke="green" />
      <Line dataKey="ebit" fill="yellow" stroke="yellow" />
      <Line dataKey="fcff" fill="white" stroke="white" />
      <XAxis
        dataKey="name"
        stroke={primaryColor}
        padding={{ right: 10 }}
        label={{
          value: 'Year',
          position: 'bottom',
          fill: primaryColor,
        }}
      />
      <YAxis
        stroke={primaryColor}
        padding={{ top: 20, bottom: 20 }}
        label={{
          value: 'Value in $MM',
          position: {
            x: 55,
            y: -5,
          },
          fill: primaryColor,
        }}
      />
      <Legend layout="vertical" align="right" verticalAlign="middle" />
      <ReferenceLine y={0} stroke={primaryColor} strokeWidth={1} />
    </LineChart>
  );
};

const ValuationOutputPanel = () => {
  const company = useSelector((state) => state.company);

  const projectedRevenueGrowthRate = projectRevenueGrowthRate(company);
  const projectedRevenue = projectRevenue(company, projectedRevenueGrowthRate);
  const projectedOperatingMargin = projectOperatingMargin(company);
  const projectedEbit = projectEbit(
    company,
    projectedRevenue,
    projectedOperatingMargin
  );
  const projectedNol = projectNol(company, projectedEbit);
  const projectedTaxRate = projectTaxRate(company);
  const projectedTaxExpense = projectTaxExpense(
    projectedEbit,
    projectedTaxRate,
    projectedNol
  );
  const projectedReinvestmentExpense = projectReinvestmentExpense(
    company,
    projectedRevenueGrowthRate,
    projectedRevenue,
    projectedEbit,
    projectedTaxExpense
  );
  const projectedInvestedCapital = projectInvestedCapital(
    company,
    projectedReinvestmentExpense
  );
  const projectedRoic = projectRoic(
    company,
    projectedInvestedCapital,
    projectedEbit,
    projectedTaxExpense
  );
  const projectedSalesCap = projectSalesCap(company);
  const projectedFcff = projectFcff(
    projectedEbit,
    projectedTaxExpense,
    projectedReinvestmentExpense
  );
  const projectedCoc = projectCoc(company);
  const projectedDiscountFactor = projectDiscountFactor(projectedCoc);
  const projectedPvFcff = projectPvFcff(projectedFcff, projectedDiscountFactor);

  const terminalValue = calculateTerminalValue(
    projectedFcff,
    projectedCoc,
    projectedRevenueGrowthRate
  );
  const pvTerminalValue = calculatePvTerminalValue(
    terminalValue,
    projectedDiscountFactor
  );
  const pvCf = calculatePvCf(projectedPvFcff);
  const sumOfPv = pvTerminalValue + pvCf;
  const failureProceeds = sumOfPv / 2;
  const valueOfOperatingAssets =
    sumOfPv * (1 - company.failureChance / 100) +
    (failureProceeds * company.failureChance) / 100;
  const valueOfEquity =
    valueOfOperatingAssets -
    company.debt['Q10'] -
    company.minorityInterests['Q10'] +
    company.cash['Q10'] +
    company.nonOperatingAssets['Q10'];
  const valueOfOptions = calculateValueOfOptions(company);
  const valueOfEquityCommon = valueOfEquity - valueOfOptions;
  const valuePerShare =
    company.shares === 0 ? 0 : valueOfEquityCommon / company.shares;
  const priceValue =
    valuePerShare === 0 ? 0 : (company.stockPrice / valuePerShare) * 100;

  const decimalWrapper = (input) => input.toFixed(2);
  const currencyWrapper = (input) =>
    input.toLocaleString('en-US', {
      maximumFractionDigits: 2,
    });

  return (
    <Box
      sx={{
        padding: 2,
      }}
    >
      <TableContainer
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <SmallTableCell />
              <SmallTableCell>Base Year</SmallTableCell>
              <SmallTableCell>Next Year</SmallTableCell>
              <SmallTableCell>+2</SmallTableCell>
              <SmallTableCell>+3</SmallTableCell>
              <SmallTableCell>+4</SmallTableCell>
              <SmallTableCell>+5</SmallTableCell>
              <SmallTableCell>+6</SmallTableCell>
              <SmallTableCell>+7</SmallTableCell>
              <SmallTableCell>+8</SmallTableCell>
              <SmallTableCell>+9</SmallTableCell>
              <SmallTableCell>+10</SmallTableCell>
              <SmallTableCell>Terminal</SmallTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <PopulatedTableRow
              data={projectedRevenueGrowthRate}
              label="Revenue Growth Rate"
              prefix=""
              suffix="%"
              wrapper={decimalWrapper}
            />
            <PopulatedTableRow
              data={projectedRevenue}
              label="Revenues"
              prefix="$"
              suffix="MM"
              wrapper={currencyWrapper}
            />
            <PopulatedTableRow
              data={projectedOperatingMargin}
              label="EBIT Margin"
              prefix=""
              suffix="%"
              wrapper={decimalWrapper}
            />
            <PopulatedTableRow
              data={projectedEbit}
              label="EBIT"
              prefix="$"
              suffix="MM"
              wrapper={currencyWrapper}
            />
            <PopulatedTableRow
              data={projectedTaxRate}
              label="Tax Rate"
              prefix=""
              suffix="%"
              wrapper={decimalWrapper}
            />
            <PopulatedTableRow
              data={projectedTaxExpense}
              label="Tax Expense"
              prefix="$"
              suffix="MM"
              wrapper={currencyWrapper}
            />
            <PopulatedTableRow
              data={projectedReinvestmentExpense}
              label="Reinvestment Expense"
              prefix="$"
              suffix="MM"
              wrapper={currencyWrapper}
            />
            <PopulatedTableRow
              data={projectedFcff}
              label="FCFF"
              prefix="$"
              suffix="MM"
              wrapper={currencyWrapper}
            />
            <PopulatedTableRow
              data={projectedNol}
              label="NOL"
              prefix="$"
              suffix="MM"
              wrapper={currencyWrapper}
            />
            <PopulatedTableRow
              data={projectedCoc}
              label="Cost of Capital"
              prefix=""
              suffix="%"
              wrapper={decimalWrapper}
            />
            <PopulatedTableRow
              data={projectedDiscountFactor}
              label="Cumulated Discount Factor"
              prefix=""
              suffix="%"
              wrapper={decimalWrapper}
            />
            <PopulatedTableRow
              data={projectedPvFcff}
              label="PV(FCFF)"
              prefix="$"
              suffix="MM"
              wrapper={currencyWrapper}
            />
            <PopulatedTableRow
              data={projectedSalesCap}
              label="Sales to Capital"
              prefix=""
              suffix=""
              wrapper={decimalWrapper}
            />
            <PopulatedTableRow
              data={projectedInvestedCapital}
              label="Invested Capital"
              prefix="$"
              suffix="MM"
              wrapper={currencyWrapper}
            />
            <PopulatedTableRow
              data={projectedRoic}
              label="ROIC"
              prefix=""
              suffix="%"
              wrapper={decimalWrapper}
            />
          </TableBody>
        </Table>
      </TableContainer>
      <br />
      <Stack
        spacing={2}
        direction="row"
        sx={{
          alignItems: 'center',
        }}
      >
        <TableContainer
          sx={{
            width: 400,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Terminal Value</TableCell>
                <TableCell>{`$${currencyWrapper(terminalValue)}MM`}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>PV(Terminal Value)</TableCell>
                <TableCell>{`$${currencyWrapper(pvTerminalValue)}MM`}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>PV(Cash Flow over 10 Years)</TableCell>
                <TableCell>{`$${currencyWrapper(pvCf)}MM`}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Sum of PV</TableCell>
                <TableCell>{`$${currencyWrapper(sumOfPv)}MM`}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Probability of Failure</TableCell>
                <TableCell>{`${decimalWrapper(company.failureChance)}%`}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Proceeds if Firm Fails</TableCell>
                <TableCell>{`$${currencyWrapper(failureProceeds)}MM`}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Value of Operating Assets</TableCell>
                <TableCell>{`$${currencyWrapper(valueOfOperatingAssets)}MM`}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>- Debt</TableCell>
                <TableCell>{`$${currencyWrapper(company.debt['Q10'])}MM`}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>- Minority Interests</TableCell>
                <TableCell>
                  {`$${currencyWrapper(company.minorityInterests['Q10'])}MM`}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>+ Cash</TableCell>
                <TableCell>{`$${currencyWrapper(company.cash['Q10'])}MM`}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Value of Equity</TableCell>
                <TableCell>{`$${currencyWrapper(valueOfEquity)}MM`}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>- Value of Options</TableCell>
                <TableCell>{`$${currencyWrapper(valueOfOptions)}MM`}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Value of Equity in Common Stock</TableCell>
                <TableCell>{`$${currencyWrapper(valueOfEquityCommon)}MM`}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Shares Outstanding</TableCell>
                <TableCell>{`${company.shares.toLocaleString('US-en')} million`}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Stack>
          <ValuationBarChart
            pvTerminalValue={pvTerminalValue}
            pvCf={pvCf}
            failureChance={company.failureChance}
            failureProceeds={failureProceeds}
            debt={company.debt['Q10']}
            minorityInterests={company.minorityInterests['Q10']}
            cash={company.cash['Q10']}
            valueOfOptions={valueOfOptions}
            valueOfEquityCommon={valueOfEquityCommon}
          />
          <CashFlowLineChart
            projectedRevenue={projectedRevenue}
            projectedEbit={projectedEbit}
            projectedFcff={projectedFcff}
          />
        </Stack>
      </Stack>
      <br />
      <Stack
        padding={2}
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h4">
          Value per Share = {`$${currencyWrapper(valuePerShare)}`}
        </Typography>
        <Typography variant="h4">
          Price per Share = {`$${currencyWrapper(company.stockPrice)}`}
        </Typography>
        <Typography variant="h4">
          Price / Value = {`${decimalWrapper(priceValue)}%`}
        </Typography>
      </Stack>
    </Box>
  );
};

export default ValuationOutputPanel;
