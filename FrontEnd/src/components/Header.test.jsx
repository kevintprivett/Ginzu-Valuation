import { screen } from '@testing-library/react'

import { renderWithProvider } from '../utils/testUtils.jsx'
import Header from './Header'


describe('Header', async () => {
  beforeEach(() => {
    renderWithProvider(<Header />)
  })

  test('component renders', () => {
    const element = screen.getByText(
      'Ginzu Valuation Model'
    )

    expect(element).toBeDefined()
  })
})
