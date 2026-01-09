import { screen } from '@testing-library/react'

import { renderWithProvider } from '../utils/testUtils.jsx'
import ErpCountry from './ErpCountry'


describe('ErpCountry', async () => {
  beforeEach(() => {
    renderWithProvider(<ErpCountry />)
  })

  test('component renders', () => {
    const element = screen.getByText(
      /Country of Incorporation:/
    )

    expect(element).toBeDefined()
  })
})
