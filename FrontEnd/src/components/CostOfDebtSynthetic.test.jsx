import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProvider } from '../utils/testUtils.jsx'
import CostOfDebtSynthetic from './CostOfDebtSynthetic'


describe('CostOfDebtSynthetic', async () => {
  beforeEach(() => {
    renderWithProvider(<CostOfDebtSynthetic />)
  })

  test('component renders', () => {
    const element = screen.getByText(
      'Company Type'
    )

    expect(element).toBeDefined()
  })


  describe('Verify company type select box', () => {
    test('Verify that a company type can be selected', async () => {
      const user = userEvent.setup()

      const dropDown = screen.getByText('Large and Safe Company')

      await user.click(dropDown)

      const select = screen.getByText(
        'Small and Risky Company'
      )

      expect(select).toBeDefined()

      await user.click(select)

      const newComponent = screen.getByText('Small and Risky Company')

      expect(newComponent).toBeDefined()
    })
  })
})
