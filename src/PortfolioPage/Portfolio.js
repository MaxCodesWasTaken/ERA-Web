import React, { useState, useEffect } from 'react'; // Import useEffect here
import { useNavigate } from 'react-router-dom';
import './Portfolio.css';
function Portfolio() {
    const navigate = useNavigate();
    const handleMain = () => {
        fetch('/api/main', {
            method: 'GET',
        })
            .then(response => {
                if (response.ok) {
                    return response.json();  // parse the JSON data from the response
                } else {
                    throw new Error('Network response was not ok.');
                }
            })
            .then(data => {
                if (data.success) {
                    navigate(data.message);
                } else {
                    navigate('/');
                }
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
                navigate('/');
            });
    };

    const handleAccount = () => {
        fetch('/api/account', {
            method: 'GET',
        })
            .then(response => {
                if (response.ok) {
                    return response.json();  // parse the JSON data from the response
                } else {
                    throw new Error('Network response was not ok.');
                }
            })
            .then(data => {
                if (data.success) {
                    navigate(data.message);
                } else {
                    navigate('/');
                }
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
                navigate('/');
            });
    }
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
    return (
        <div className="Portfolio">
            <header className="portfolio-header">
                <h1>Earnings Report Action</h1>
                <div className="window-controls">
                    <button onClick={handleAccount} className="account-button" title="Account">Account</button>
                    <button onClick={handleMain} className="home-button">Home</button>
                    <button onClick={handleLogout} className="logout-button">Logout</button>
                </div>
            </header>
            <div className="portfolio-container">
                <div className="portfolio-content">

                </div>
                <div className="bottom-bar">
                    Copyright Notice &copy; 2024 Max Wang. All rights reserved.
                </div>
            </div>
        </div>
    );
}

export default Portfolio;