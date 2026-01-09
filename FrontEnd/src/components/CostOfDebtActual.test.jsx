import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProvider } from '../utils/testUtils.jsx'
import CostOfDebtActual from './CostOfDebtActual'


describe('CostOfDebtActual', async () => {
  beforeEach(() => {
    renderWithProvider(<CostOfDebtActual />)
  })

  test('component renders', () => {
    const element = screen.getByText(
      'Company Debt Rating'
    )

    expect(element).toBeDefined()
  })


  describe('Verify credit rating select box', () => {
    test('Verify that a rating can be selected', async () => {
      const user = userEvent.setup()

      const dropDown = screen.getByText('Select a Credit Rating')

      await user.click(dropDown)

      const select = screen.getByText(
        'A3/A-'
      )

      expect(select).toBeDefined()

      await user.click(select)

      const newComponent = screen.getByText('A3/A-')

      expect(newComponent).toBeDefined()
    })
  })
})
