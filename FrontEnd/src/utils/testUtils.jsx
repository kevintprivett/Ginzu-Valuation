import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { test, expect } from 'vitest'

import companyReducer from '../reducers/companyReducer'
import { rfrApi } from '../services/apiService'

export const renderWithProvider = (ui) => {
  const store = configureStore({
    reducer: {
      company: companyReducer,
    },
  })

  const ProviderWrapper = ({ children }) => {
    return (
      <Provider store={store}>
        {children}
      </Provider>
    )
  }

  return {
    store, 
    ...render(ui, { wrapper: ProviderWrapper })
  }
}

export const testDigitalOnlyInput = ({ providedInput, prefix='', suffix='' }) => {
  test('Accepts digital input', async () => {
    const user = userEvent.setup()

    const input = providedInput()

    await user.type(input, '12345')
    
    expect(input).toHaveValue(`${prefix}12,345${suffix}`)
  })

  test('Does not accept alphabetic input', async () => {
    const user = userEvent.setup()

    const input = providedInput()

    await user.type(input, 'abcd')
    
    expect(input).toHaveValue(`${prefix}0${suffix}`)
  })
}
