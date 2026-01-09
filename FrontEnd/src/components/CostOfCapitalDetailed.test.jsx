import { screen } from '@testing-library/react'

import { renderWithProvider } from '../utils/testUtils.jsx'
import CostOfCapitalDetailed from './CostOfCapitalDetailed'


describe('CostOfCapitalDetailed', async () => {
  beforeEach(() => {
    renderWithProvider(<CostOfCapitalDetailed />)
  })

  test('component renders', () => {
    const equityComponent = screen.getByText(
      /Shares Outstanding:/
    )

    expect(equityComponent).toBeDefined()
  
    const debtComponent = screen.getByText(
      /Book Value of Debt:/
    )

    expect(debtComponent).toBeDefined()

    const preferredComponent = screen.getByText(
      /Number of Preferred Shares/
    )

    expect(preferredComponent).toBeDefined()

    const outputComponent = screen.getByText(
      'Output'
    )

    expect(outputComponent).toBeDefined()
  })
})
