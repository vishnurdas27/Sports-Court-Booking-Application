import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
// Import your pages
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    // 1. Wrap everything in AuthProvider so user state is available everywhere
    <AuthProvider>
      {/* 2. Wrap in Router to enable navigation */}
      <Router>
        <Routes>
          {/* 3. Define the Rules */}
          {/* If URL is "/", show BookingPage */}
          <Route path="/" element={<BookingPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* If URL is "/login", show LoginPage */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Catch-all: If they type random junk, go back to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;