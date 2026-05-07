import { screen } from '@testing-library/react';

import {
  renderWithProvider,
  testDigitalOnlyInput,
} from '../utils/testUtils.jsx';
import BetaDirect from './BetaDirect';

describe('BetaDirect', async () => {
  beforeEach(() => {
    renderWithProvider(<BetaDirect />);
  });

  test('component renders', () => {
    const element = screen.getByText('Beta');

    expect(element).toBeDefined();
  });

  describe('Verify Digital Only Input', () => {
    const input = () => {
      return screen.getByRole('textbox');
    };

    testDigitalOnlyInput({
      providedInput: input,
    });
  });
});
