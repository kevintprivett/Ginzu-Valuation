import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProvider } from '../utils/testUtils.jsx'
import CostOfEquity from './CostOfEquity'


describe('CostOfEquity', async () => {
  beforeEach(() => {
    renderWithProvider(<CostOfEquity />)
  })

  test('component renders', () => {
    const element = screen.getByText(
      /Shares Outstanding:/
    )

    expect(element).toBeDefined()
  })


  describe('Verify beta approach select box', () => {
    test('Verify direct', async () => {
      const user = userEvent.setup()

      const dropDown = screen.getAllByRole('combobox')[0]

      await user.click(dropDown)

      const select = screen.getByText(
        /Direct Input/
      )

      expect(select).toBeDefined()

      await user.click(select)

      const newComponent = screen.getByText('Beta')

      expect(newComponent).toBeDefined()
    })

    test('Verify single', async () => {
      const user = userEvent.setup()

      const dropDown = screen.getAllByRole('combobox')[0]

      await user.click(dropDown)

      const select = screen.getAllByText(
        /Single Business/
      )[1]

      expect(select).toBeDefined()

      await user.click(select)

      const newComponent = screen.getByText(/Industry:/)

      expect(newComponent).toBeDefined()
    })

    test('Verify multi', async () => {
      const user = userEvent.setup()

      const dropDown = screen.getAllByRole('combobox')[0]

      await user.click(dropDown)

      const select = screen.getByText(
        /Multiple Businesses/
      )

      expect(select).toBeDefined()

      await user.click(select)

      const newComponent = screen.getByText('EV/Sales')

      expect(newComponent).toBeDefined()
    })
  })

  describe('Verify ERP approach select box', () => {
    test('Verify direct', async () => {
      const user = userEvent.setup()

      const dropDown = screen.getAllByRole('combobox')[1]

      await user.click(dropDown)

      const select = screen.getByText(
        /Direct Input/
      )

      expect(select).toBeDefined()

      await user.click(select)

      const newComponent = screen.getByText('ERP')

      expect(newComponent).toBeDefined()
    })

    test('Verify country', async () => {
      const user = userEvent.setup()

      const dropDown = screen.getAllByRole('combobox')[1]

      await user.click(dropDown)

      const select = screen.getAllByText(
        /Country of Incorporation/
      )[1]

      expect(select).toBeDefined()

      await user.click(select)

      const newComponent = screen.getByText(/Country of Incorporation:/)

      expect(newComponent).toBeDefined()
    })

    test('Verify countries', async () => {
      const user = userEvent.setup()

      const dropDown = screen.getAllByRole('combobox')[1]

      await user.click(dropDown)

      const select = screen.getByText(
        /Operating Countries/
      )

      expect(select).toBeDefined()

      await user.click(select)

      const newComponent = screen.getByText('Country')

      expect(newComponent).toBeDefined()
    })

    test('Verify regions', async () => {
      const user = userEvent.setup()

      const dropDown = screen.getAllByRole('combobox')[1]

      await user.click(dropDown)

      const select = screen.getByText(
        /Operating Regions/
      )

      expect(select).toBeDefined()

      await user.click(select)

      const newComponent = screen.getByText('Region')

      expect(newComponent).toBeDefined()
    })
  })
})
