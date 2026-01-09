import { screen } from '@testing-library/react'

import { renderWithProvider } from '../utils/testUtils.jsx'
import ValuationOutputPanel from './ValuationOutputPanel'


describe('ValuationOutputPanel', async () => {
  beforeEach(() => {
    renderWithProvider(<ValuationOutputPanel />)
  })

  test('component renders', () => {
    const element = screen.getByText(
      'Terminal Value'
    )

    expect(element).toBeDefined()
  })
})
