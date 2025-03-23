// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header'; // Adjust path if needed
import Footer from './components/Footer'; // Adjust path if needed
import LandingPage from './components/LandingPage';
import BookingProcess from './components/BookingProcess';
import { AuthProvider } from './context/AuthContext';
import ProfilePage from './pages/ProfilePage';
import MyBookingsPage from './pages/MyBookingsPage';
import AboutPage from './pages/AboutPage';
import MyXAIPage from './pages/MyXAIPage';
import Management from './pages/Management'; // Create this component


const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="full-width">
          <Header />
        </div>
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/booking" element={<BookingProcess />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/management" element={<Management />} />
            <Route path="/myxai" element={<MyXAIPage />} />
          </Routes>
        </main>
        <div className="full-width">
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;