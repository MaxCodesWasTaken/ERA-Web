import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Login from './LoginPage/Login';
import Main from './MainPage/Main';
import Account from './AccountPage/Account';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLogin = async () => {
        setIsLoggedIn(true);
    };

    const ProtectedRoute = ({ children }) => {
        return isLoggedIn ? children : <Navigate to="/" replace />;
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={isLoggedIn ? <Navigate to="/home" replace /> : <Login onLogin={handleLogin} />} />
                <Route path="/login" element={isLoggedIn ? <Navigate to="/home" replace /> : <Login onLogin={handleLogin} />} />
                <Route path="/home" element={<ProtectedRoute><Main /></ProtectedRoute>} />
                <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                {/* Add other protected routes similarly */}
            </Routes>
        </Router>
    );
}

export default App;