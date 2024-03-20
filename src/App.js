import React, { useState } from 'react'; // Import useState here
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Login from './LoginPage/Login';
import Main from './MainPage/Main';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Use the useState hook

    const handleLogin = (username, password) => {
        // Perform authentication
        // For demonstration, we'll assume authentication is successful
        setIsLoggedIn(true);
        // In a real app, you would check username and password against a user service or database
    };

    return (
        <Router>
            <Routes>
                <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />
                <Route path="/" element={isLoggedIn ? <Main /> : <Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;