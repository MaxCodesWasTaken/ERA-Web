import React, { useState } from 'react';
import './Login.css';
import loginImage from '../logow.jpg';
function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const handleLogin = async (event) => {
        event.preventDefault();
        setMessage('');  // Clear previous error
        setIsError(false);
        if (username == null || username === '') {
            console.error('Login error:', message);
            setMessage('Username cannot be left blank');
            setIsError(true);
        }
        else if (password == null || password === '') {
            console.error('Login error:', message);
            setMessage('Password cannot be left blank');
            setIsError(true);
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
                setMessage('Login failed: ' + data.message);
                setIsError(true);
                setPassword('');  // Optional: Clear password field
            }
        }
    };
    const handleRegister = async (event) => {
        event.preventDefault();
        setMessage(''); // Clear previous error
        if (username == null || username === '') {
            console.error('Registration error:', message);
            setMessage('Username cannot be left blank');
            setIsError(true);
        }
        else if (password == null || password === '') {
            console.error('Registration error:', message);
            setMessage('Password cannot be left blank');
            setIsError(true);
        }
        else {
            const response = await fetch('api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            if (data.success) {
                setMessage('Registration Success!');
                setIsError(false);
            } else {
                setMessage('Registration failed: ' + data.message);
                setIsError(true);
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
                <div className={`message ${isError ? 'error-message' : 'success-message'}`}>{message}</div>
            </div>
            <div className="bottom-bar">
                Copyright Notice &copy; 2024 Max Wang. All rights reserved.
            </div>
        </div>
    );
}

export default Login;