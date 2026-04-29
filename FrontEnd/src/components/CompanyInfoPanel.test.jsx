import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  renderWithProvider,
  testDigitalOnlyInput,
} from '../utils/testUtils.jsx';
import CompanyInfoPanel from './CompanyInfoPanel';

describe('CompanyInfoPanel', async () => {
  beforeEach(async () => {
    renderWithProvider(<CompanyInfoPanel />);
  });

  test('component renders', () => {
    const element = screen.getByText(/Date of Valuation/);

    expect(element).toBeDefined();
  });

  describe('Verify digital only input', () => {
    const input = () => {
      return screen.getAllByRole('textbox')[2];
    };

    testDigitalOnlyInput({
      providedInput: input,
      prefix: '$',
    });
  });

  describe('Verify industry select box', () => {
    test('Can select another industry', async () => {
      const user = userEvent.setup();

      const dropDown = screen.getByText(/Choose an Industry/);

      await user.click(dropDown);

      const select = screen.getByText(/Auto Parts/);

      expect(select).toBeDefined();

      await user.click(select);

      const newDropDown = screen.getByText(/Auto Parts/);

      expect(newDropDown).toBeDefined();
    });
  });

  describe('Verify search link', () => {
    test('Link appears when ticker is present', async () => {
      const user = userEvent.setup();

      const linkBefore = screen.queryByText(/Search/);

      expect(linkBefore).toBeNull();

      const ticker = screen.getAllByRole('textbox')[0];

      await user.clear(ticker);
      await user.type(ticker, 'AAPL');

      const linkAfter = screen.getByText(/Search/);

      expect(linkAfter).toBeDefined();
    });
  });
});
