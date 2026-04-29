import { screen } from '@testing-library/react';

import {
  renderWithProvider,
  testDigitalOnlyInput,
} from '../utils/testUtils.jsx';
import CostOfCapitalDirect from './CostOfCapitalDirect';

describe('CostOfCapitalDirect', async () => {
  beforeEach(() => {
    renderWithProvider(<CostOfCapitalDirect />);
  });

  test('component renders', () => {
    const element = screen.getAllByText(/Cost of Capital/)[0];

    expect(element).toBeDefined();

    const input = screen.getByRole('textbox');

    expect(input).toBeDefined();
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
