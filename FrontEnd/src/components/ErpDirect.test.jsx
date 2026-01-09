import { screen } from '@testing-library/react'

import { renderWithProvider, testDigitalOnlyInput } from '../utils/testUtils.jsx'
import ErpDirect from './ErpDirect'


describe('ErpDirect', async () => {
  beforeEach(() => {
    renderWithProvider(<ErpDirect />)
  })

  test('component renders', () => {
    const element = screen.getByText(
      'ERP'
    )

    expect(element).toBeDefined()
  })


  describe('Verify Digital Only Input', () => {
    const input = () => {
      return screen.getByRole('textbox')
    }

    testDigitalOnlyInput({
      providedInput: input,
      suffix: '%'
    })
  })
})
