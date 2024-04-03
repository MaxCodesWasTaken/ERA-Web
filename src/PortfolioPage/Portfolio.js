import React, { useEffect, useState} from 'react'; // Import useEffect here
import { useNavigate } from 'react-router-dom';
import './Portfolio.css';
import handleMain from '../Navigation/handleMain';
import handleAccount from '../Navigation/handleAccount';
import handleLogout from '../Navigation/handleLogout';
function Portfolio() {
    const navigate = useNavigate();
    const [alpacaUserCreds, setAlpacaUserCreds] = useState({
        key: '',
        secret: '',
    });
    const [alpacaUser, setAlpacaUser] = useState({
        userid: '',
        account_number: '',
        buying_power: '',
        portfolio_value: '',

    });
    const [alpacaAccountFound, setAlpacaAccountFound] = useState({});

    useEffect(() => {
        fetchAlpacaAccount();
    });

    const fetchAlpacaAccount = async () => {
        try {
            const response = await fetch("/api/useralpacainfo");
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            const data = await response.json();
            setAlpacaUser({
                ...alpacaUser,
                userid: data.userid, // Assuming 'user' is the field you want, adjust if the API provides a different field name
                account_number: data.account_number,
                buying_power: data.buying_power,
                portfolio_value: data.portfolio_value,
            });
            setAlpacaAccountFound(true);
        } catch (error) {
            console.error("No Alpaca account information on record", error);
            setAlpacaAccountFound(false);
        }
    };

    const handleSidebarNavigation = (category) => {
        if (category === 'Positions') {

        }
        else if (category === 'Trades') {

        }
        else if (category === 'Orders') {

        }        
        else if (category === 'Balances') {

        }
        else;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        // Call /api/edituseralpacainfo endpoint with username, apikey, and apikeysecret
        try {
            const response = await fetch('/api/edituseralpacainfo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    apikey: alpacaUserCreds.key,
                    apikeysecret: alpacaUserCreds.secret
                })
            });

            if (!response.ok) {
                throw new Error('Failed to edit user Alpaca info');
            }

            const data = await response.json();
            alert('Alpaca info updated successfully!');
            console.log('Success:', data);
        } catch (error) {
            console.error('Error updating Alpaca info:', error);
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setAlpacaUserCreds(prevCreds => ({
            ...prevCreds,
            [name]: value
        }));
    };

    return (
        <div className="Portfolio">
            <header className="portfolio-header">
                <h1>Earnings Report Action</h1>
                <div className="window-controls">
                    <button onClick={() => handleAccount(navigate)} className="account-button" title="Account">Account</button>
                    <button onClick={() => handleMain(navigate)} className="home-button">Home</button>
                    <button onClick={() => handleLogout(navigate)} className="logout-button">Logout</button>
                </div>
            </header>
            <div className="portfolio-container">
                <div className="portfolio-sidebar">
                    <div className="portfolio-sidebar-list">
                        <button onClick={() => handleSidebarNavigation('Positions')} className="portfolio-sidebar-button">Positions</button>
                        <button onClick={() => handleSidebarNavigation('Trade')} className="portfolio-sidebar-button">Trade</button>
                        <button onClick={() => handleSidebarNavigation('Orders')} className="portfolio-sidebar-button">Orders</button>                    
                        <button onClick={() => handleSidebarNavigation('Balances')} className="portfolio-sidebar-button">Balances</button>
                    </div>
                </div>
                <div className="portfolio-content">
                    <section className="portfolio-content-header">
                        <div className="portfolio-account-name">Account: {alpacaUser.account_number}</div>
                    </section>
                    <section className="portfolio-details">
                        <div className="portfolio-alpaca-accinfo">
                        </div>
                        <div className="portfolio-alpaca-keyinfo">
                            <form className= "portfolio-key-form" onSubmit={handleSubmit}>
                                <label className="portfolio-key-form-label">
                                    API Key:
                                    <input className="portfolio-key-form-input"
                                        type="text"
                                        name="key"
                                        value={alpacaUserCreds.key}
                                        onChange={handleInputChange}
                                    />
                                </label>
                                <label className="portfolio-key-form-label">
                                    API Secret:
                                    <input className= "portfolio-key-form-input"
                                        type="password"
                                        name="secret"
                                        value={alpacaUserCreds.secret}
                                        onChange={handleInputChange}
                                    />
                                </label>
                                <button type="submit" className="submit-button">Submit</button>
                            </form>
                        </div>
                    </section>
                </div>
                <div className="bottom-bar">
                    Copyright Notice &copy; 2024 Max Wang. All rights reserved.
                </div>
            </div>
        </div>
    );
}

export default Portfolio;