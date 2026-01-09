## Ginzu Valuation Model Website

Data used in this model as well as the model this webapp is based on was provided by Professor Damodaran at this website:
https://pages.stern.nyu.edu/~adamodar/

### FrontEnd

Available commands:

```
npm run dev
npm run build
npm run preview
npm run lint
npm run test
npm run coverage
```

### Pipeline

Various pipelines to update marketData.json

market_data_pipeline.ipynb should be run yearly, usually around late January, depending on when Prof. Damodaran makes his data updates.  It should be run one cell at a time as the data tables may be formatted differently year to year.

erp_update.py and rfr_update.py can be ran automatically to update erp on a monthly basis and rfr on a weekly or daily basis.