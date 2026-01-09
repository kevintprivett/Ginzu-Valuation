import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProvider } from '../utils/testUtils.jsx'
import CostOfDebt from './CostOfDebt'


describe('CostOfDebt', async () => {
  beforeEach(() => {
    renderWithProvider(<CostOfDebt />)
  })

  test('component renders', () => {
    const element = screen.getByText(
      'Cost of Debt Approach'
    )

    expect(element).toBeDefined()
  })


  describe('Verify approach select box', () => {
    test('Verify direct', async () => {
      const user = userEvent.setup()

      const dropDown = screen.getAllByRole('combobox')[0]

      await user.click(dropDown)

      const select = screen.getByText(
        /Direct Input/
      )

      expect(select).toBeDefined()

      await user.click(select)

      const newComponent = screen.getByText('Cost of Debt')

      expect(newComponent).toBeDefined()
    })

    test('Verify synthetic', async () => {
      const user = userEvent.setup()

      const dropDown = screen.getAllByRole('combobox')[0]

      await user.click(dropDown)

      const select = screen.getByText(
        /Synthetic Credit Rating/
      )

      expect(select).toBeDefined()

      await user.click(select)

      const newComponent = screen.getByText('Company Type')

      expect(newComponent).toBeDefined()
    })

    test('Verify actual', async () => {
      const user = userEvent.setup()

      const dropDown = screen.getAllByRole('combobox')[0]

      await user.click(dropDown)

      const select = screen.getAllByText(
        /Actual Credit Rating/
      )[1]

      expect(select).toBeDefined()

      await user.click(select)

      const newComponent = screen.getByText('Company Debt Rating')

      expect(newComponent).toBeDefined()
    })
  })
})
