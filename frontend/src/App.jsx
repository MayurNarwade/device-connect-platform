import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { router } from './router';
import Toast from './components/ui/toast';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './components/error-fallback';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <AnimatePresence mode="wait">
          <RouterProvider router={router} />
        </AnimatePresence>
        <Toast />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}