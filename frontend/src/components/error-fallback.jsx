import { Frown } from 'lucide-react';
import Card from './ui/card';
import Button from './ui/button';

export default function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="text-center max-w-sm w-full">
        <Frown size={48} className="mx-auto text-error mb-4" />
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-gray-500 text-sm mb-6">{error?.message || 'An unexpected error occurred.'}</p>
        <Button onClick={resetErrorBoundary}>Try Again</Button>
      </Card>
    </div>
  );
}