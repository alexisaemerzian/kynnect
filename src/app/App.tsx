import { useMemo } from 'react';
import { RouterProvider } from 'react-router';
import { createAppRouter } from './routes';
import { Toaster } from './components/ui/sonner';
import '../styles/calendar.css';

export default function App() {
  const router = useMemo(() => createAppRouter(), []);
  
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}