import { screen } from '@testing-library/react';

import {
  renderWithProvider,
  testDigitalOnlyInput,
} from '../utils/testUtils.jsx';
import CostOfDebtDirect from './CostOfDebtDirect';

describe('CostOfDebtDirect', async () => {
  beforeEach(() => {
    renderWithProvider(<CostOfDebtDirect />);
  });

  test('component renders', () => {
    const element = screen.getByText('Cost of Debt');

    expect(element).toBeDefined();
  });

  describe('Verify Digital Only Input', () => {
    const input = () => {
      return screen.getByRole('textbox');
    };

    testDigitalOnlyInput({
      providedInput: input,
      suffix: '%',
    });
  });
});
