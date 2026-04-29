import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_URL = import.meta.env.VITE_API_URL;

export const getTicker = (ticker) => {
  return fetch(`${API_URL}/tickers/${ticker}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error()
      }
      return res.json()
    })
    .catch(() => {
      console.error(`Data for ${ticker} not found`)
      return null
    })
}

export const rfrApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: `${API_URL}/` }),
  keepUnusedDataFor: 4 * 60 * 60, // 4 hours
  refetchOnMountOrArgChange: 4 * 60 * 60,
  endpoints: (build) => ({
    getRfr: build.query({
      query: () => 'rfr'
    })
  })
})