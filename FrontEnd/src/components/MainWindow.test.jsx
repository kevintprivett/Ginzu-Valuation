import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProvider } from '../utils/testUtils.jsx';
import MainWindow from './MainWindow';

describe('MainWindow', async () => {
  beforeEach(() => {
    renderWithProvider(<MainWindow />);
  });

  test('component renders', () => {
    const element = screen.getByText('Company Info');

    expect(element).toBeDefined();
  });

  describe('Verify tab panel functionality', () => {
    test('Verify default to company info', async () => {
      const element = screen.getByText('Date of Valuation');

      expect(element).toBeDefined();
    });

    test('Verify Financials tab', async () => {
      const user = userEvent.setup();

      const tab = screen.getAllByRole('tab')[1];

      await user.click(tab);

      const newPanel = screen.getByText('Interest Expense');

      expect(newPanel).toBeDefined();
    });

    test('Verify COC tab', async () => {
      const user = userEvent.setup();

      const tab = screen.getAllByRole('tab')[2];

      await user.click(tab);

      const newPanel = screen.getByText('Cost of Capital Approach');

      expect(newPanel).toBeDefined();
    });

    test('Verify misc tab', async () => {
      const user = userEvent.setup();

      const tab = screen.getAllByRole('tab')[3];

      await user.click(tab);

      const newPanel = screen.getByText('Are There R&D Expenses?');

      expect(newPanel).toBeDefined();
    });

    test('Verify future tab', async () => {
      const user = userEvent.setup();

      const tab = screen.getAllByRole('tab')[4];

      await user.click(tab);

      const newPanel = screen.getByText('Revenue Growth Rate');

      expect(newPanel).toBeDefined();
    });

    test('Verify output tab', async () => {
      const user = userEvent.setup();

      const tab = screen.getAllByRole('tab')[5];

      await user.click(tab);

      const newPanel = screen.getByText('Terminal Value');

      expect(newPanel).toBeDefined();
    });
  });
});
