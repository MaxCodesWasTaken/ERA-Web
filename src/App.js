import React, { useState, useEffect } from 'react'; // Import useEffect here
import './App.css'; // Correct the path to the CSS file

function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Current date in YYYY-MM-DD format
    const [importance, setImportance] = useState('All Stocks');
    const [stocks, setStocks] = useState([]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleDateChange = (event) => {
        setDate(event.target.value);
    };

    const handleImportanceChange = (event) => {
        setImportance(event.target.value);
    };

    const searchStock = () => {
        console.log('Searching for', searchTerm);
        // Add search logic here
    };

    const filterResults = () => {
        console.log('Filtering results for date:', date, 'and importance:', importance);
        // Add filter logic here
    };

    useEffect(() => {
        fetchEarningsCalendar();
    }, []);

    const fetchEarningsCalendar = async () => {
        const url = "https://api.stocktwits.com/api/2/discover/earnings_calendar";
        try {
            const response = await fetch(url);
            const data = await response.json();
            const earnings = data.earnings;

            const allEarningsData = [];
            for (const date in earnings) {
                const dateEarnings = earnings[date];
                const stocks = dateEarnings.stocks;
                for (const stock of stocks) {
                    const { symbol, title, date: earningsDate, time, importance } = stock;
                    allEarningsData.push({ symbol, title, earningsDate, time, importance });
                }
            }

            setStocks(allEarningsData);
        } catch (error) {
            console.error("Unable to get earnings calendar", error);
        }
    };

    return (
        <div className="App">
            <header className="app-header">
                <h1>Earnings Report Action</h1>
                <div className="window-controls">
                    {/* Placeholder for window controls like minimize, maximize, close */}
                </div>
            </header>
            <div className="app-container">
                <div className="sidebar">
                    <div className="stock-list-container">
                        <div className="stock-list">
                            {stocks.map((stock, index) => (
                                <div key={index} className="stock-item" onClick={() => console.log('Clicked', stock.symbol)}>
                                    <div>Symbol: {stock.symbol}</div>
                                    <div>Title: {stock.title}</div>
                                    <div>Date: {stock.earningsDate}</div>
                                    <div>Time: {stock.time}</div>
                                    <div>Importance: {stock.importance}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="filter-controls">
                        <select value={importance} onChange={handleImportanceChange}>
                            <option value="All Stocks">All Stocks</option>
                            <option value="3 and above">3 and above</option>
                            <option value="Market Movers">Market Movers</option>
                        </select>
                        <input type="date" value={date} onChange={handleDateChange} />
                        <button onClick={filterResults}>Filter</button>
                    </div>
                </div>
                <div className="main-content">
                    <main className="stock-details">
                        <input type="text" value={searchTerm} onChange={handleSearchChange} placeholder="Search stock" />
                        <button onClick={searchStock}>Search</button>
                        <div>Stock details and search results will be displayed here</div>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default App;