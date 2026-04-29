import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { PersistGate } from 'redux-persist/integration/react';

import App from './App.jsx';
import theme from './theme';
import companyReducer from './reducers/companyReducer';
import { rfrApi } from './services/apiService.js';

const companyPersistConfig = {
  key: 'company',
  storage,
};

const persistedCompanyReducer = persistReducer(
  companyPersistConfig,
  companyReducer
);

const rfrPersistConfig = {
  key: rfrApi.reducerPath,
  storage,
  whitelist: ['queries'],
};

const persistedRfrReducer = persistReducer(rfrPersistConfig, rfrApi.reducer);

const store = configureStore({
  reducer: {
    company: persistedCompanyReducer,
    [rfrApi.reducerPath]: persistedRfrReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(rfrApi.middleware),
});

const persistor = persistStore(store);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </ThemeProvider>
  </StrictMode>
);
