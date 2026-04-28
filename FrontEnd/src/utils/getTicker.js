const API_URL = import.meta.env.VITE_API_URL;

const getTicker = (ticker) => {
  return fetch(`${API_URL}/tickers/${ticker}`)
    .then((res) => res.json())
    .catch(console.error)
}

export default getTicker