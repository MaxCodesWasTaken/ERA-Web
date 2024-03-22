import React, { useState } from 'react';
import './Login.css';
import loginImage from '../logo.jpg';
function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const handleLogin = async (event) => {
        event.preventDefault();
        setError('');  // Clear previous error
        if (username == null || username === '') {
            console.error('Login error:', error);
            setError('Username cannot be left blank');
        }
        else if (password == null || password === '') {
            console.error('Login error:', error);
            setError('Password cannot be left blank');
        }
        else {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            if (data.success) {
                onLogin(username, password); // Handle successful login
            } else {
                setError('Login failed: ' + data.message);
                setPassword('');  // Optional: Clear password field
            }
        }
    };
    const handleRegister = async (event) => {
        event.preventDefault();
        setError('');  // Clear previous error
        if (username == null || username === '') {
            console.error('Registration error:', error);
            setError('Username cannot be left blank');
        }
        else if (password == null || password === '') {
            console.error('Registration error:', error);
            setError('Password cannot be left blank');
        }
        else {
            console.log(JSON.stringify({ username, password }));
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            if (data.success) {
                onLogin(username, password); // Handle successful login
            } else {
                setError('Registration failed: ' + data.message);
                setPassword('');  // Optional: Clear password field
            }
        }
    };

    return (
        <div>
            <div className="logo-container">
                <img src={loginImage} alt="Company logo" alt-text="Logo Image" className="logo-image"></img>
            </div>
            <div className="login-container">
                <form className="login-form">
                    <h2>Login</h2>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="button-container">
                        <button type="button" onClick={handleLogin} className="login-button">Log In</button>
                        <button type="button" onClick={handleRegister} className="login-button">Register</button>
                    </div>
                </form>
                <div className="error-message">{error}</div>
            </div>
            <div className="bottom-bar">
                Copyright Notice &copy; 2024 Max Wang. All rights reserved.
            </div>
        </div>
    );
}

export default Login;