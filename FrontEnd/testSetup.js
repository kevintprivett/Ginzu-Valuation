import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('./src/services/apiService', () => ({
  rfrApi: {
    endpoints: {
      getRfr: {
        useQuery: vi.fn().mockReturnValue({
          data: 4.0,
        }),
      },
    },
  },
}));

afterEach(() => {
  cleanup();
});
