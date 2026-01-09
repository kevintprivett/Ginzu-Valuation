import { screen } from '@testing-library/react'

import { renderWithProvider } from '../utils/testUtils.jsx'
import BetaSingle from './BetaSingle'


describe('BetaSingle', async () => {
  beforeEach(() => {
    renderWithProvider(<BetaSingle />)
  })

  test('component renders', () => {
    const element = screen.getByText(
      /Industry:/
    )

    expect(element).toBeDefined()
  })
})
