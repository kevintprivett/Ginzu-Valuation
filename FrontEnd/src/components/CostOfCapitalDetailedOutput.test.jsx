import { screen } from '@testing-library/react';

import { renderWithProvider } from '../utils/testUtils.jsx';
import CostOfCapitalDetailedOutput from './CostOfCapitalDetailedOutput';

describe('CostOfCapitalDetailedOutput', async () => {
  beforeEach(() => {
    renderWithProvider(<CostOfCapitalDetailedOutput />);
  });

  test('component renders', () => {
    const equityCell = screen.getByText('Equity');

    expect(equityCell).toBeDefined();

    const weightCell = screen.getByText('Weight in Cost of Capital');

    expect(weightCell).toBeDefined();
  });
});
