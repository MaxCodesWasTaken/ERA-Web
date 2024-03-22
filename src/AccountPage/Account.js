import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Account.css';
function Account() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            const response = await fetch('/api/logout');
            console.log('User logged out successfully');
            if (response.ok) {
                localStorage.removeItem('userToken');
                window.location.href = '/'; // Adjust the URL based on your routing setup
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };
    const handleMain = () => {
        navigate('/home');
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:5000/api/userinfo', { method: 'GET', credentials: 'include' }); // Adjust the URL as needed
            if (!response.ok) {
                console.error('No user information was gathered');
                return null;
            }
            const data = await response.json();
            setIsLoading(false);
            setUser({
                user: data.username,
                firstName: data.firstname,
                lastName: data.lastname,
                email: data.email,
            });
        } catch (error) {
            setError('Failed to load user data');
            setIsLoading(false);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="account">
            <header className="account-header">
                <h1>Earnings Report Action</h1>
                <div className="window-controls">
                    <button onClick={handleMain} className="home-button" title="Home">Home</button>
                    <button onClick={handleLogout} className="logout-button" title="Logout">Logout</button>
                </div>
            </header>
            <div className="app-container">
                <div className="sidebar">

                </div>
                <div className="main-content">
                    <div className="user-info-container">
                        <div className="info-details">Username: {user.username}</div>
                    </div>
                </div>
                <div className="bottom-bar">
                    Copyright Notice &copy; 2024 Max Wang. All rights reserved.
                </div>
            </div>
        </div>
    );
}

export default Account;