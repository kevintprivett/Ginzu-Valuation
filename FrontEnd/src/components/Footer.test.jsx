import { screen } from '@testing-library/react'

import { renderWithProvider } from '../utils/testUtils.jsx'
// import Footer from './Footer'


describe('Footer', async () => {
  beforeEach(() => {
    renderWithProvider(<Footer />)
  })

  const unusedVar = 'test'

  test('component renders', () => {
    const element = screen.getByText(
      'Created by Kevin Privett'
    )

    expect(element).toBeDefined()
  })
})
