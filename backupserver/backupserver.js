const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
const axios = require('axios');
const PORT = 5000;
const session = require('express-session');
const ConnectPgSimple = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
const corsOptions = {
    origin: 'http://localhost:3000', // Allow only this origin to send requests with credentials
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};
app.use(cors(corsOptions));
app.use(express.json());

app.use(session({
    store: new ConnectPgSimple({
        pool: pool, // Using the pool for session storage
    }),
    secret: process.env.SESSION_SECRET,  // This should be a long, random string
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using https, also ensure the "secure" option is used in production!
        maxAge: 1 * 24 * 60 * 60 * 1000 // Example: 1 day
    }
}));

app.get('/api/account', (req, res) => {
    if (req.session.userId) {
        // User is logged in, proceed to dashboard
        res.json({ success: true, message: '/account' });
    } else {
        // User is not logged in, redirect to login page
        res.redirect('/');
    }
});

app.get('/api/portfolio', (req, res) => {
    if (req.session.userId) {
        // User is logged in, proceed to dashboard
        res.json({ success: true, message: '/portfolio' });
    } else {
        // User is not logged in, redirect to login page
        res.redirect('/');
    }
});

app.get('/api/main', (req, res) => {
    if (req.session.userId) {
        // User is logged in, proceed to dashboard
        res.json({ success: true, message: '/home' });
    } else {
        // User is not logged in, redirect to login page
        res.redirect('/');
    }
});

app.get('/protected-route', (req, res) => {
    if (!isAuthenticated(req)) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    res.json({ success: true, message: 'You are authenticated' });
});

const bcrypt = require('bcrypt');

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (username == null || username === '') {
        console.error('Registration error:  Username cannot be left blank');
        res.status(500).json({ success: false, message: 'Username cannot be left blank' });
    }
    else if (password == null || password === '') {
        console.error('Registration error:  Password cannot be left blank');
        res.status(500).json({ success: false, message: 'Password cannot be left blank' });
    }
    const saltRounds = 10; // Define salt rounds for bcrypt
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Save username and hashedPassword to the database
    // Assuming you have a function to save the user to your database
    try {
        await saveUserToDatabase(username, hashedPassword);
        res.json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Error registering user' });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (username == null || username === '') {
        console.error('Login error: Username cannot be left blank');
        res.status(500).json({ success: false, message: 'Username cannot be left blank' });
    }
    else if (password == null || password === '') {
        console.error('Login error: Password cannot be left blank');
        res.status(500).json({ success: false, message: 'Password cannot be left blank' });
    }
    try {
        const user = await getUserFromDatabase(username);
        // Check if the user was found before trying to compare passwords
        if (user) {
            const match = await bcrypt.compare(password, user.hashed_password);
            if (match) {
                req.session.userId = user.id;  // Storing user id in session
                req.session.username = user.username; // Store other needed properties
                res.json({ success: true, message: 'Login successful' });
            } else {
                res.status(401).json({ success: false, message: 'Username or Password is incorrect.' });
            }
        } else {
            // If no user was found, respond with an error
            res.status(401).json({ success: false, message: 'Username or Password is incorrect.' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Error logging in' });
    }
});

app.post('/api/logout', async (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error during logout' });
        }
        res.clearCookie('connect.sid'); // Adjust the cookie name if needed
        res.json({ success: true, message: 'Logout successful' });
    });
});

app.get('/api/userinfo', async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    try {
        const userInfo = await getUserInfoFromDatabase(req.session.userId);
        if (userInfo) {
            res.json(userInfo);
        } else {
            res.status(404).json({ success: false, message: 'User information not found' });
        }
    } catch (error) {
        console.error("Unable to get user info:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/edituserinfo', async (req, res) => {
    const { username, firstName, lastName, email } = req.body;
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    try {
        await saveUserInfoToDatabase(req.session.userId, firstName, lastName, email);
        res.json({ success: true, message: 'edit successful' });
    }
    catch (error) {
        console.error('Error editing user info:', error);
        res.status(500).json({ success: false, message: 'Error editing user info' });
    }
});

app.post('/api/deleteuserinfo', async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    try {
        await deleteUserFromDatabase(req.session.userId);
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Error deleting user:' });
    }
});

app.get('/api/earnings-calendar', async (req, res) => {
    const url = 'https://api.stocktwits.com/api/2/discover/earnings_calendar';
    try {
        const response = await axios.get(url);
        const data = response.data; // Axios automatically parses the JSON response
        res.json(data);
    } catch (error) {
        console.error("Unable to get earnings calendar", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/stock-data', async (req, res) => {
    const symbol = req.query.symbol; // Use req.query for GET requests
    const url = `https://api.iex.cloud/v1/data/core/iex_tops/${symbol}?token=${process.env.IEX_API_KEY}`;

    try {
        const response = await axios.get(url);
        const data = response.data;
        const stockData = data[0] || {}; // Assuming the first object is what we need
        res.json(stockData);
    } catch (error) {
        console.error("Failed to retrieve stock data", error);
        res.status(500).json({ error: 'Failed to retrieve stock data' });
    }
});

app.get('/api/stock-OCHL', async (req, res) => {
    const symbol = req.query.symbol;
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${process.env.POLYGON_API_KEY}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            res.json({
                open: result.o,
                close: result.c,
                high: result.h,
                low: result.l,
                volume: result.v
            });
        } else {
            res.status(404).json({ message: 'No data available for this symbol' });
        }
    } catch (error) {
        console.error("Failed to retrieve stock OCHL data for", symbol, error);
        res.status(500).json({ error: 'Failed to retrieve stock OCHL data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).send("Not authenticated");
    }
}

const getUserFromDatabase = async (username) => {
    const query = 'SELECT * FROM users WHERE username = $1';
    try {
        const { rows } = await pool.query(query, [username]);
        if (rows.length === 0) {
            return null; // User not found
        }
        //console.error('User match!');
        return rows[0]; // Return the first row (user)
    } catch (error) {
        console.error('Error fetching user from database:', error);
        throw error; // Rethrow or handle as needed
    }
};
const saveUserToDatabase = async (username, hashedPassword) => {
    const createLoginQuery = `
        INSERT INTO users (username, hashed_password, firstname, lastname, email)
        VALUES ($1, $2, ' ', ' ', ' ')
    `;

    try {
        // Using the pool to query the database
        const rows = await pool.query(createLoginQuery, [username, hashedPassword]);
        return rows[0]; // Returning the newly created user ID
    } catch (error) {
        console.error('Error saving user to database:', error);
        throw error; // Rethrow the error or handle it as needed
    }
};

const saveUserInfoToDatabase = async (userid, firstname, lastname, email) => {
    const createAccountQuery = `
        UPDATE users
        SET firstname = $2, lastname = $3, email = $4
        WHERE id = $1
     `;
    try {
        // Using the pool to query the database
        await pool.query(createAccountQuery, [userid, firstname, lastname, email]);
        //console.log('User info saved!');
        return;
    } catch (error) {
        console.error('Error saving user info to database:', error);
        throw error; // Rethrow the error or handle it as needed
    }
};

const getUserInfoFromDatabase = async (userId) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        return result.rows[0]; // Assuming the first row contains the user info
    } catch (error) {
        console.error('Database error in getUserInfoFromDatabase:', error);
        throw error;
    }
}

const deleteUserFromDatabase = async (userId) => {
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1', [userId]);
        return result.rows[0]; // Assuming the first row contains the user info
    } catch (error) {
        console.error('Database error in deleteUserInfoFromDatabase:', error);
        throw error;
    }
}