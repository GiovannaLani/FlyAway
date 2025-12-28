import './App.css'

import { type JSX } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import TripsPage from "./pages/TripsPage";
import { useAuth } from "./auth/AuthProvider";
import Header from "./components/Header";
import CreateTripPage from './pages/CreateTripPage';
import TripDetailPage from './pages/TripDetailPage';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <>
      <BrowserRouter>
        <div className="pt-5">
          <Header />
        </div>
        <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/trips"
          element={
            <PrivateRoute>
              <TripsPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/trips/new"
          element={
            <PrivateRoute>
              <CreateTripPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/trips/:tripId"
          element={
            <PrivateRoute>
              <TripDetailPage />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
