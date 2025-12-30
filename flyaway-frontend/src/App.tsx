import './App.css'

import { type JSX } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import { useAuth } from "./auth/AuthProvider";
import Header from "./components/Header";
import CreateTripPage from './pages/CreateTripPage';
import TripDetailPage from './pages/TripDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import Footer from './components/Footer';
import EditProfilePage from './pages/EditProfilePage';
import FriendsPage from './pages/FriendsPage';
import BackLayout from './components/BackLayout';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function App() {

  return (
    <>
      <BrowserRouter>
      <div className="app-layout">

        <div className="pt-5">
          <Header />
        </div>
        <main className="flex-grow-1">

        <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/"
          element={
              <HomePage />
          }
        />

        <Route
          path="/trips/new"
          element={
            <PrivateRoute>
              <BackLayout>
                <CreateTripPage />
              </BackLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/trips/:tripId"
          element={
            <PrivateRoute>
              <BackLayout>
                <TripDetailPage />
              </BackLayout>
            </PrivateRoute>
          }
        />

        <Route path="/users/:userId" element={
          <PrivateRoute>
            <BackLayout>
              <UserProfilePage />
            </BackLayout>
          </PrivateRoute>
        } />

        <Route path="/profile/edit" element={
          <PrivateRoute>
            <BackLayout>
              <EditProfilePage />
            </BackLayout>
          </PrivateRoute>
        } />

        <Route path="/friends" element={
          <PrivateRoute>
            <BackLayout>
              <FriendsPage />
            </BackLayout>
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
              </main>

      <Footer />
      </div>
    </BrowserRouter>
    </>
  )
}

export default App
