import { useMemo } from 'react';
import { RouterProvider } from 'react-router';
import { createAppRouter } from './routes';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './context/AuthContext';
import { EthnicityProvider } from './context/EthnicityContext';
import { AdminProvider } from './context/AdminContext';
import { AdminDataProvider } from './context/AdminDataContext';
import { FollowProvider } from './context/FollowContext';
import '../styles/calendar.css';

// Main application component

export default function App() {
  const router = useMemo(() => createAppRouter(), []);

  return (
    <AuthProvider>
      <EthnicityProvider>
        <AdminProvider>
          <AdminDataProvider>
            <FollowProvider>
              <RouterProvider router={router} />
              <Toaster />
            </FollowProvider>
          </AdminDataProvider>
        </AdminProvider>
      </EthnicityProvider>
    </AuthProvider>
  );
}