import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  renderWithProvider,
  testDigitalOnlyInput,
} from '../utils/testUtils.jsx';
import ErpRegion from './ErpRegion';

describe('ErpRegion', async () => {
  beforeEach(() => {
    renderWithProvider(<ErpRegion />);
  });

  test('component renders', () => {
    const element = screen.getByText('Region');

    expect(element).toBeDefined();
  });

  describe('Verify digital only input', () => {
    const input = () => {
      return screen.getByRole('textbox');
    };

    testDigitalOnlyInput({
      providedInput: input,
      prefix: '$',
      suffix: 'MM',
    });
  });

  describe('Verify country select box', () => {
    test('Can select another industry', async () => {
      const user = userEvent.setup();

      const dropDown = screen.getByText(/North America/);

      await user.click(dropDown);

      const select = screen.getByText(/Asia/);

      expect(select).toBeDefined();

      await user.click(select);

      const newDropDown = screen.getByText(/Asia/);

      expect(newDropDown).toBeDefined();
    });
  });

  test('Verify adding and removing rows', async () => {
    const user = userEvent.setup();

    let revBoxes = screen.getAllByRole('textbox');

    expect(revBoxes.length).toStrictEqual(1);

    const add = screen.getByTestId('AddCircleOutlineIcon');

    await user.click(add);

    revBoxes = screen.getAllByRole('textbox');

    expect(revBoxes.length).toStrictEqual(2);

    const remove = screen.getByTestId('RemoveCircleOutlineIcon');

    await user.click(remove);

    revBoxes = screen.getAllByRole('textbox');

    expect(revBoxes.length).toStrictEqual(1);
  });
});
