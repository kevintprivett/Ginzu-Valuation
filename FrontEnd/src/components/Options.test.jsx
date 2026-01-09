import { screen, act } from '@testing-library/react'

import { renderWithProvider, testDigitalOnlyInput } from '../utils/testUtils.jsx'
import Options from './Options'
import { update } from '../reducers/companyReducer'


describe('Options', async () => {
  let store
  beforeEach(() => {
    const result = renderWithProvider(<Options />)

    store = result.store
  })

  test('component renders', () => {
    const element = screen.getByText(
      'Average Maturity'
    )

    expect(element).toBeDefined()
  })


  describe('Verify input for number of options', () => {
    const input = () => {
      return screen.getAllByRole('textbox')[0]
    }

    testDigitalOnlyInput({
      providedInput: input,
      suffix: ' million'
    })
  })

  describe('Verify input for strike price', () => {
    const input = () => {
      return screen.getAllByRole('textbox')[1]
    }

    testDigitalOnlyInput({
      providedInput: input,
      prefix: '$'
    })
  })

  describe('Verify input for maturity', () => {
    const input = () => {
      return screen.getAllByRole('textbox')[2]
    }

    testDigitalOnlyInput({
      providedInput: input,
      suffix: ' years'
    })
  })

  describe('Verify input for IV', () => {
    const input = () => {
      return screen.getAllByRole('textbox')[3]
    }

    testDigitalOnlyInput({
      providedInput: input,
      suffix: '%'
    })
  })

  describe('Verify search links', () => {
    test('Link appears when ticker and name is present', async () => {
      const linkBefore= screen.queryByText(
        /Yahoo Options Search/
      )

      expect(linkBefore).toBeNull()

      act(() => {
        store.dispatch(update({
          key: 'ticker',
          value: 'GOOGL'
        }))
      })

      const linkAfter= await screen.findByText(
        /Yahoo Options Search/
      )

      expect(linkAfter).toBeDefined()
    })
  })
})
