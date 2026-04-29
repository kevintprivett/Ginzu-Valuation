import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProvider } from '../utils/testUtils.jsx';
import CostOfCapitalPanel from './CostOfCapitalPanel';

describe('CostOfCapitalPanel', async () => {
  beforeEach(() => {
    renderWithProvider(<CostOfCapitalPanel />);
  });

  test('component renders', () => {
    const element = screen.getByText('Cost of Capital Approach');

    expect(element).toBeDefined();
  });

  describe('Verify approach select box', () => {
    test('Verify direct', async () => {
      const user = userEvent.setup();

      const dropDown = screen.getAllByRole('combobox')[0];

      await user.click(dropDown);

      const select = screen.getByText(/Direct Input/);

      expect(select).toBeDefined();

      await user.click(select);

      const newComponent = screen.getByDisplayValue('0%');

      expect(newComponent).toBeDefined();
    });

    test('Verify average', async () => {
      const user = userEvent.setup();

      const dropDown = screen.getAllByRole('combobox')[0];

      await user.click(dropDown);

      const select = screen.getByText(/Industry Average/);

      expect(select).toBeDefined();

      await user.click(select);

      const newComponent = screen.getByText('Business');

      expect(newComponent).toBeDefined();
    });

    test('Verify detailed', async () => {
      const user = userEvent.setup();

      const dropDown = screen.getAllByRole('combobox')[0];

      await user.click(dropDown);

      const select = screen.getAllByText(/Detailed Approach/)[1];

      expect(select).toBeDefined();

      await user.click(select);

      const newComponent = screen.getByText(/Shares Outstanding:/);

      expect(newComponent).toBeDefined();
    });
  });
});
