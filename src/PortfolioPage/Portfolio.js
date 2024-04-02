import React from 'react'; // Import useEffect here
import { useNavigate } from 'react-router-dom';
import './Portfolio.css';
import handleMain from '../Navigation/handleMain';
import handleAccount from '../Navigation/handleAccount';
import handleLogout from '../Navigation/handleLogout';
function Portfolio() {
    const navigate = useNavigate();
    const handleSidebarNavigation = (category) => {
        if (category === 'Positions') {

        }
        else if (category === 'Orders') {

        }
        else if (category === 'Activities') {

        }
        else if (category === 'Balances') {

        }
        else;
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
                        <button onClick={() => handleSidebarNavigation('Orders')} className="portfolio-sidebar-button">Orders</button>
                        <button onClick={() => handleSidebarNavigation('Activities')} className="portfolio-sidebar-button">Activities</button>
                        <button onClick={() => handleSidebarNavigation('Balances')} className="portfolio-sidebar-button">Balances</button>
                    </div>
                </div>
                <div className="portfolio-content">
                    <section className="portfolio-details">

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