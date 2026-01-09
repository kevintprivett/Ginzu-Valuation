import { screen } from '@testing-library/react'

import { renderWithProvider, testDigitalOnlyInput } from '../utils/testUtils.jsx'
import PreferredStock from './PreferredStock'


describe('PreferredStock', async () => {
  beforeEach(() => {
    renderWithProvider(<PreferredStock />)
  })

  test('component renders', () => {
    const element = screen.getByText(
      'Number of Preferred Shares'
    )

    expect(element).toBeDefined()
  })


  describe('Verify input for number of shares', () => {
    const input = () => {
      return screen.getAllByRole('textbox')[0]
    }

    testDigitalOnlyInput({
      providedInput: input
    })
  })

  describe('Verify input for market price', () => {
    const input = () => {
      return screen.getAllByRole('textbox')[1]
    }

    testDigitalOnlyInput({
      providedInput: input,
      prefix: '$'
    })
  })

  describe('Verify input for dividend', () => {
    const input = () => {
      return screen.getAllByRole('textbox')[2]
    }

    testDigitalOnlyInput({
      providedInput: input,
      prefix: '$'
    })
  })
})
