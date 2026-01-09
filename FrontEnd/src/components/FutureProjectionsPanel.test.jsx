import { screen } from '@testing-library/react'

import { renderWithProvider, testDigitalOnlyInput } from '../utils/testUtils.jsx'
import FutureProjectionsPanel from './FutureProjectionsPanel'
import userEvent from '@testing-library/user-event'

describe('FutureProjectionsPanel', async () => {
  beforeEach(async () => {
    renderWithProvider(<FutureProjectionsPanel />)
    const user = userEvent.setup()

    const override_rev = screen.getAllByRole('checkbox')[0]
    const override_coc = screen.getAllByRole('checkbox')[1]

    await user.click(override_rev)
    await user.click(override_coc)
  })

  test('component renders', () => {
    const element = screen.getByText(
      'Revenue Growth Rate'
    )

    expect(element).toBeDefined()
  })


  describe('Verify input for object row (next)', () => {
    const input = () => {
      return screen.getAllByRole('textbox')[0]
    }

    testDigitalOnlyInput({
      providedInput: input,
      prefix: '',
      suffix: '%'
    })
  })

  describe('Verify input for object row (mid)', () => {
    const input = () => {
      return screen.getAllByRole('textbox')[1]
    }

    testDigitalOnlyInput({
      providedInput: input,
      prefix: '',
      suffix: '%'
    })
  })

  describe('Verify input for object row (long)', async () => {
    const input = () => {
      return screen.getAllByRole('textbox')[2]
    }

    testDigitalOnlyInput({
      providedInput: input,
      prefix: '',
      suffix: '%'
    })
  })

  describe('Verify input for simple row', () => {
    const input = () => {
      return screen.getAllByRole('textbox')[9]
    }

    testDigitalOnlyInput({
      providedInput: input,
      prefix: '',
      suffix: '%'
    })
  })
})
