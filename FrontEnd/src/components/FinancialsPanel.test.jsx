import { screen, act } from '@testing-library/react';

import {
  renderWithProvider,
  testDigitalOnlyInput,
} from '../utils/testUtils.jsx';
import FinancialsPanel from './FinancialsPanel';

import { update } from '../reducers/companyReducer';

describe('FinancialsPanel', async () => {
  let store;
  beforeEach(() => {
    const result = renderWithProvider(<FinancialsPanel />);

    store = result.store;
  });

  test('component renders', () => {
    const element = screen.getByText('Interest Expense');

    expect(element).toBeDefined();
  });

  describe('Verify input for simple row', () => {
    const input = () => {
      // average maturity of debt
      return screen.getAllByRole('textbox')[10];
    };

    testDigitalOnlyInput({
      providedInput: input,
      prefix: '',
      suffix: ' years',
    });
  });

  describe('Verify input for object row (Q10)', () => {
    const input = () => {
      // Equity most recent quarter
      return screen.getAllByRole('textbox')[7];
    };

    testDigitalOnlyInput({
      providedInput: input,
      prefix: '$',
      suffix: 'MM',
    });
  });

  describe('Verify input for object row (K10)', () => {
    const input = () => {
      // Equity yearly
      return screen.getAllByRole('textbox')[8];
    };

    testDigitalOnlyInput({
      providedInput: input,
      prefix: '$',
      suffix: 'MM',
    });
  });

  describe('Verify search links', () => {
    test('Link appears when ticker and name is present', async () => {
      const linkBeforeYahoo = screen.queryByText(/Yahoo Finance Search/);

      const linkBeforeEdgar = screen.queryByText(/EDGAR Filings Search/);

      expect(linkBeforeYahoo).toBeNull();
      expect(linkBeforeEdgar).toBeNull();

      act(() => {
        store.dispatch(
          update({
            key: 'ticker',
            value: 'GOOGL',
          })
        );
      });

      const linkAfterYahoo = await screen.findByText(/Yahoo Finance Search/);

      expect(linkAfterYahoo).toBeDefined();

      act(() => {
        store.dispatch(
          update({
            key: 'name',
            value: 'Alphabet',
          })
        );
      });

      const linkAfterEdgar = await screen.findByText(/EDGAR Filings Search/);

      expect(linkAfterEdgar).toBeDefined();
    });
  });
});
