import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProvider, testDigitalOnlyInput } from '../utils/testUtils.jsx'
import BetaMulti from './BetaMulti'


describe('BetaMulti', async () => {
  beforeEach(() => {
    renderWithProvider(<BetaMulti />)
  })

  test('component renders', () => {
    const element = screen.getByText(
      /Unlevered Beta/
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

  describe('Verify industry select box', () => {
    test('Can select another industry', async () => {
      const user = userEvent.setup()

      const dropDown = screen.getByText(
        /Choose an Industry/
      )

      await user.click(dropDown)

      const select = screen.getByText(
        /Auto Parts/
      )

      expect(select).toBeDefined()

      await user.click(select)

      const newDropDown = screen.getByText(
        /Auto Parts/
      )

      expect(newDropDown).toBeDefined()
    })
  })

  test('Verify adding and removing rows', async () => {
    
    const user = userEvent.setup()

    let revBoxes = screen.getAllByText(
      /Choose an Industry/
    )

    expect(revBoxes.length).toStrictEqual(1)

    const add = screen.getByTestId('AddCircleOutlineIcon')

    await user.click(add)

    revBoxes = screen.getAllByText(
      /Choose an Industry/
    )

    expect(revBoxes.length).toStrictEqual(2)

    const remove = screen.getByTestId('RemoveCircleOutlineIcon')

    await user.click(remove)

    revBoxes = screen.getAllByText(
      /Choose an Industry/
    )

    expect(revBoxes.length).toStrictEqual(1)
  })
})
