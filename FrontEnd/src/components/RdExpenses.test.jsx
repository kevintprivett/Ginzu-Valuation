import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProvider, testDigitalOnlyInput } from '../utils/testUtils.jsx'
import RdExpenses from './RdExpenses'


describe('RdExpenses', async () => {
  beforeEach(() => {
    renderWithProvider(<RdExpenses />)
  })

  test('component renders', () => {
    const element = screen.getByText(
      'Current Year Expenses'
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

  test('Verify adding and removing rows', async () => {
    
    const user = userEvent.setup()

    let inputs = screen.getAllByRole('textbox')

    expect(inputs.length).toStrictEqual(1)

    const add = screen.getByTestId('AddCircleOutlineIcon')

    await user.click(add)

    inputs = screen.getAllByRole('textbox')

    expect(inputs.length).toStrictEqual(2)

    const remove = screen.getByTestId('RemoveCircleOutlineIcon')

    await user.click(remove)

    inputs = screen.getAllByRole('textbox')

    expect(inputs.length).toStrictEqual(1)
  })
})
