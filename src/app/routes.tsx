import { createBrowserRouter, Outlet, Navigate } from "react-router";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./context/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { OnboardingPage } from "./pages/OnboardingPage";
import { HomePage } from "./pages/HomePage";
import { EventDetailsPage } from "./pages/EventDetailsPage";
import { CreateEventPage } from "./pages/CreateEventPage";
import { ProfilePage } from "./pages/ProfilePage";
import { UserProfilePage } from "./pages/UserProfilePage";
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

function RootLayout() {
  return <Outlet />;
}

function LandingPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!loading && !checked) {
      setChecked(true);
      if (isAuthenticated) {
        navigate('/home', { replace: true });
      }
    }
  }, [loading, isAuthenticated, navigate, checked]);

  if (loading || (isAuthenticated && !checked)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return <OnboardingPage />;
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
          element: <LandingPage />,
        },
        {
          path: "/home",
          element: <HomePage />,
        },
        {
          path: "/feed",
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
          path: "/profile/:userId",
          element: <UserProfilePage />,
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