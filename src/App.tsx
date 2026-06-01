import { RouterProvider } from 'react-router-dom';

import { RootErrorBoundary } from '@/components/root-error-boundary';
import { AppProviders } from '@/providers';
import { router } from '@/router';

export default function App() {
  return (
    <RootErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </RootErrorBoundary>
  );
}
