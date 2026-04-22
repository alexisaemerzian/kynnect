import { createBrowserRouter, Outlet, Navigate } from "react-router";
import { HomePage } from "./pages/HomePage";
import { EventDetailsPage } from "./pages/EventDetailsPage";
import { CreateEventPage } from "./pages/CreateEventPage";
import { ProfilePage } from "./pages/ProfilePage";
import { EditProfilePage } from "./pages/EditProfilePage";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { PlacesPage } from "./pages/PlacesPage";
import { PlaceDetailsPage } from "./pages/PlaceDetailsPage";
import { MessagesPage } from "./pages/MessagesPage";
import { ConversationPage } from "./pages/ConversationPage";
import { SettingsPage } from "./pages/SettingsPage";
import { PremiumUpgradePage } from "./pages/PremiumUpgradePage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { RequestAdPage } from "./pages/RequestAdPage";
import { SupportPage } from "./pages/SupportPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { EditEventPage } from "./pages/EditEventPage";
import { AuthProvider } from "./context/AuthContext";
import { EthnicityProvider } from "./context/EthnicityContext";
import { AdminProvider } from "./context/AdminContext";
import { AdminDataProvider } from "./context/AdminDataContext";
import { FollowProvider } from "./context/FollowContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

function RootLayout() {
  return (
    <AuthProvider>
      <EthnicityProvider>
        <AdminProvider>
          <AdminDataProvider>
            <FollowProvider>
              <Outlet />
            </FollowProvider>
          </AdminDataProvider>
        </AdminProvider>
      </EthnicityProvider>
    </AuthProvider>
  );
}

export function createAppRouter() {
  console.log('🔧 Creating browser router...');
  console.log('🔧 Current location:', window.location.href);
  console.log('🔧 Pathname:', window.location.pathname);
  
  return createBrowserRouter([
    {
      element: <RootLayout />,
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: "/",
          element: <HomePage />,
        },
        {
          path: "/event",
          element: <EventDetailsPage />,
        },
        {
          path: "/create",
          element: <CreateEventPage />,
        },
        {
          path: "/event/edit",
          element: <EditEventPage />,
        },
        {
          path: "/places",
          element: <PlacesPage />,
        },
        {
          path: "/places/:placeId",
          element: <PlaceDetailsPage />,
        },
        {
          path: "/messages",
          element: <MessagesPage />,
        },
        {
          path: "/messages/:conversationId",
          element: <ConversationPage />,
        },
        {
          path: "/profile",
          element: <ProfilePage />,
        },
        {
          path: "/profile/edit",
          element: <EditProfilePage />,
        },
        {
          path: "/settings",
          element: <SettingsPage />,
        },
        {
          path: "/login",
          element: <LoginPage />,
        },
        {
          path: "/signup",
          element: <SignUpPage />,
        },
        {
          path: "/forgot-password",
          element: <ForgotPasswordPage />,
        },
        {
          path: "/reset-password",
          element: <ResetPasswordPage />,
        },
        {
          path: "/admin",
          element: <AdminDashboard />,
        },
        {
          path: "/premium-upgrade",
          element: <PremiumUpgradePage />,
        },
        {
          path: "/request-ad",
          element: <RequestAdPage />,
        },
        {
          path: "/support",
          element: <SupportPage />,
        },
        {
          path: "/notifications",
          element: <NotificationsPage />,
        },
        {
          path: "*",
          element: (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Route Debug</h1>
                <p className="mb-2">Current hash: {window.location.hash}</p>
                <p className="mb-2">Current pathname: {window.location.pathname}</p>
                <button 
                  onClick={() => window.location.hash = '#/'}
                  className="bg-black text-white px-4 py-2 rounded"
                >
                  Go to Home (#/)
                </button>
              </div>
            </div>
          ),
        },
      ],
    },
  ]);
}