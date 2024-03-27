import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Account.css';

function Account() {
    const [user, setUser] = useState({
        user: '',
        firstName: '',
        lastName: '',
        email: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/userinfo', { method: 'GET', credentials: 'include' });
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            const data = await response.json();
            setUser({
                user: data.username,
                firstName: data.firstname,
                lastName: data.lastname,
                email: data.email,
            });
            setIsLoading(false);
        } catch (error) {
            setError('Failed to load user data');
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('api/logout', { method: 'POST' });
            if (!response.ok) {
                throw new Error('Logout failed');
            }
            localStorage.removeItem('userToken');
            navigate('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleMain = () => {
        navigate('/home');
    };

    const handleSave = async () => {
        // Logic to save the updated user details
        // For demonstration, just toggling edit mode without saving data
        setIsEditing(false);
        const { user: username, firstName, lastName, email } = user;
        try {
            const response = await fetch('api/edituserinfo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username, firstName, lastName, email }),
            });
            if (!response.ok) {
                throw new Error('Failed to save user info');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        // You should implement the actual save logic here, possibly sending the updated data to the server
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="account">
            <header className="account-header">
                <h1>Earnings Report Action</h1>
                <div className="window-controls">
                    <button onClick={handleMain} className="home-button">Home</button>
                    <button onClick={handleLogout} className="logout-button">Logout</button>
                </div>
            </header>
            <div className="account-container">
                <div className="account-content">
                    <div className="user-info-container">
                        <div className="userinfo-details">
                            <label htmlFor="username">Username:</label>
                            <input id="username" type="text" value={user.user} onChange={(e) => setUser({ ...user, user: e.target.value })} readOnly={true} />

                            <label htmlFor="first-name">First Name:</label>
                            <input id="first-name" type="text" value={user.firstName} onChange={(e) => setUser({ ...user, firstName: e.target.value })} readOnly={!isEditing} />

                            <label htmlFor="last-name">Last Name:</label>
                            <input id="last-name" type="text" value={user.lastName} onChange={(e) => setUser({ ...user, lastName: e.target.value })} readOnly={!isEditing} />

                            <label htmlFor="email">Email:</label>
                            <input id="email" type="text" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} readOnly={!isEditing} />
                        </div>
                        <button onClick={isEditing ? handleSave : toggleEdit} className="edit-button">
                            {isEditing ? 'Submit' : 'Edit'}
                        </button>
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