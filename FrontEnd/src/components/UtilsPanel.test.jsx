import { screen } from '@testing-library/react'

import { renderWithProvider } from '../utils/testUtils.jsx'
import UtilsPanel from './UtilsPanel'


describe('UtilsPanel', async () => {
  beforeEach(() => {
    renderWithProvider(<UtilsPanel />)
  })

  test('component renders', () => {
    const element = screen.getByText(
      'Export Company Data'
    )

    expect(element).toBeDefined()
  })
})
