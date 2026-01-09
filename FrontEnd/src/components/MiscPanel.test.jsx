import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProvider } from '../utils/testUtils.jsx'
import MiscPanel from './MiscPanel'


describe('MiscPanel', async () => {
  beforeEach(() => {
    renderWithProvider(<MiscPanel />)
  })

  test('component renders', () => {
    const element = screen.getByText(
      'Are There R&D Expenses?'
    )

    expect(element).toBeDefined()
  })


  describe('Verify misc options selections', () => {
    test('Verify options option', async () => {
      const user = userEvent.setup()

      const radio = screen.getAllByRole('radio')[0]

      await user.click(radio)

      const newComponent = screen.getByText(
        'Average Maturity'
      )

      expect(newComponent).toBeDefined()
    })

    test('Verify R&D option', async () => {
      const user = userEvent.setup()

      const radio = screen.getAllByRole('radio')[2]

      await user.click(radio)

      const newComponent = screen.getByText(
        'Current Year Expenses'
      )

      expect(newComponent).toBeDefined()
    })
  })
})
