import { useRouteError } from 'react-router';
import { Button } from './ui/button';

export function ErrorBoundary() {
  const error = useRouteError() as any;

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <span className="text-6xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Oops! Something went wrong
        </h1>
        <p className="text-gray-600 mb-6">
          {error?.statusText || error?.message || 'An unexpected error occurred'}
        </p>
        <div className="space-y-3">
          <Button 
            onClick={handleGoHome} 
            className="w-full bg-black hover:bg-gray-800"
          >
            Go to Home
          </Button>
          <Button 
            onClick={handleReload} 
            variant="outline"
            className="w-full"
          >
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  );
}