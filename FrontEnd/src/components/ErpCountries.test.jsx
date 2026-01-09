import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProvider, testDigitalOnlyInput } from '../utils/testUtils.jsx'
import ErpCountries from './ErpCountries'


describe('ErpCountries', async () => {
  beforeEach(() => {
    renderWithProvider(<ErpCountries />)
  })

  test('component renders', () => {
    const element = screen.getByText(
      'Country'
    )

    expect(element).toBeDefined()
  })

  describe('Verify digital only input', () => {
    const input = () => {
      return screen.getByRole('textbox')
    }

    testDigitalOnlyInput({
      providedInput: input,
      prefix: '$',
      suffix: 'MM'
    })
  })

  describe('Verify country select box', () => {
    test('Can select another industry', async () => {
      const user = userEvent.setup()

      const dropDown = screen.getByText(
        /United States/
      )

      await user.click(dropDown)

      const select = screen.getByText(
        /Venezuela/
      )

      expect(select).toBeDefined()

      await user.click(select)

      const newDropDown = screen.getByText(
        /Venezuela/
      )

      expect(newDropDown).toBeDefined()
    })
  })

  test('Verify adding and removing rows', async () => {
    
    const user = userEvent.setup()

    let revBoxes = screen.getAllByRole(
      'textbox'
    )

    expect(revBoxes.length).toStrictEqual(1)

    const add = screen.getByTestId('AddCircleOutlineIcon')

    await user.click(add)

    revBoxes = screen.getAllByRole(
      'textbox'
    )

    expect(revBoxes.length).toStrictEqual(2)

    const remove = screen.getByTestId('RemoveCircleOutlineIcon')

    await user.click(remove)

    revBoxes = screen.getAllByRole(
      'textbox'
    )

    expect(revBoxes.length).toStrictEqual(1)
  })
})
