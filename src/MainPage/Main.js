import React, { useState, useEffect } from 'react'; // Import useEffect here
import { useNavigate } from 'react-router-dom';
import './Main.css';
import handlePortfolio from '../Navigation/handlePortfolio';
import handleAccount from '../Navigation/handleAccount';
import handleLogout from '../Navigation/handleLogout';
function Main() {
    const [searchTerm, setSearchTerm] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Current date in YYYY-MM-DD format
    const [importance, setImportance] = useState('All Stocks');
    const [stocks, setStocks] = useState([]);
    const [stockDetails, setStockDetails] = useState(null);
    const [noOCHLData, setNoOCHLData] = useState(new Set()); // To track symbols with no OCHL data
    const [checkedStocks, setCheckedStocks] = useState({});
    const [filteredStocks, setFilteredStocks] = useState([]);
    const navigate = useNavigate();
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
        getStock(searchTerm);
    };

    const filterResults = () => {
        const filtered = stocks.filter(stock => {
            const matchesDate = stock.earningsDate === date;
            let matchesImportance = true;
            if (importance !== 'All Stocks') {
                if (importance === '3 and above') {
                    matchesImportance = parseInt(stock.importance, 10) >= 3;
                } else if (importance === 'Market Movers') {
                    matchesImportance = parseInt(stock.importance, 10) === 5;
                }
            }

            return matchesDate && matchesImportance;
        }).sort((a, b) => {
            // Assuming 'importance' is a numeric value
            return parseInt(b.importance, 10) - parseInt(a.importance, 10);
        });
        setFilteredStocks(filtered);
    };

    useEffect(() => {
        fetchEarningsCalendar();
    }, []);

    const fetchEarningsCalendar = async () => {
        try {
            const response = await fetch('/api/earnings-calendar');
            const data = await response.json();
            const earnings = data.earnings;

            const allEarningsData = [];
            const today = new Date().toISOString().split('T')[0];
            for (const date in earnings) {
                if (date >= today) {
                    const dateEarnings = earnings[date];
                    for (const stock of dateEarnings.stocks) {
                        const { symbol, title, date: earningsDate, time, importance } = stock;
                        allEarningsData.push({ symbol, title, earningsDate, time, importance });
                    }
                }
            }
            // Sort allEarningsData by importance in descending order
            allEarningsData.sort((a, b) => parseInt(b.importance, 10) - parseInt(a.importance, 10));

            setStocks(allEarningsData);
            setFilteredStocks(allEarningsData);  // Initialize filteredStocks with all stocks
        } catch (error) {
            console.error("Unable to get earnings calendar", error);
        }
    };
    const getStock = async (symbol, title) => {
        if (noOCHLData.has(symbol)) {
            setStockDetails({ error: `Unable to get OCHL data for ${symbol}` });
            return;
        }

        let sOCHL = checkedStocks[symbol];
        if (!sOCHL) {
            sOCHL = await fetchStockOCHL(symbol);
            if (sOCHL) {
                setCheckedStocks(prevStocks => ({ ...prevStocks, [symbol]: sOCHL }));
            } else {
                setNoOCHLData(prevData => new Set(prevData).add(symbol));
                return;
            }
        }
        try {
            const response = await fetch(`/api/stock-data?symbol=${symbol}`); // Pass symbol as a query parameter
            const stockData = await response.json(); // Use response.json() to parse the JSON response
            const { bidPrice, askPrice, lastSalePrice, volume } = stockData;
            const change = lastSalePrice - sOCHL.close;
            const changePercent = (change / sOCHL.close) * 100;

            setStockDetails({
                symbol,
                title,
                open: sOCHL.open,
                close: sOCHL.close,
                high: sOCHL.high,
                low: sOCHL.low,
                bidPrice,
                askPrice,
                lastSalePrice,
                change,
                changePercent,
                volume,
                lastUpdated: new Date().toLocaleString()
            });
        } catch (error) {
            console.error("Failed to retrieve stock data", error);
        }
    };
    const fetchStockOCHL = async (symbol) => {
        try {
            const response = await fetch(`/api/stock-OCHL?symbol=${symbol}`);
            const data = await response.json();

            if (response.ok) {
                return {
                    open: data.open,
                    close: data.close,
                    high: data.high,
                    low: data.low,
                    volume: data.volume
                };
            } else {
                console.error('No OCHL data available for', symbol);
                return null;
            }
        } catch (error) {
            console.error("Unable to get stock OCHL data for", symbol, error);
            return null;
        }
    };

    return (

        <div className="App">
            <header className="app-header">
                <h1>Earnings Report Action</h1>
                <div className="window-controls">
                    <button onClick={() => handlePortfolio(navigate)} className="portfolio-button" title="Portfolio">Portfolio</button>
                    <button onClick={() => handleAccount(navigate)} className="account-button" title="Account">Account</button>
                    <button onClick={() => handleLogout(navigate)} className="logout-button">Logout</button>
                </div>
            </header>
            <div className="app-container">
                <div className="sidebar">
                    <div className="stock-list-container">
                        <div className="stock-list">
                            {filteredStocks.map((stock, index) => (
                                <div key={index} className="stock-item" onClick={() => getStock(stock.symbol, stock.title)}>
                                    <div className="sidebar-symbol">{stock.symbol}</div>
                                    <div className="sidebar-title">{stock.title}</div>
                                    <div className="sidebar-details">
                                        Earnings: {
                                            new Date(stock.earningsDate + 'T00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })
                                        } @ {stock.time.length > 5 ? stock.time.slice(0, 5) : stock.time}
                                    </div>
                                    <div className="sidebar-details">Importance: {stock.importance}</div>
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
                    <section className="search-section">
                        <input type="text" value={searchTerm} onChange={handleSearchChange} placeholder="Search stock" />
                        <button onClick={searchStock}>Search</button>
                    </section>
                    <section className="stock-details">
                        {stockDetails ? (
                            <div className="stock-info-container">
                                <div className="info-symbol">{stockDetails.symbol}</div>
                                <div className="info-details">{stockDetails.title}</div>
                                <div className="info-price">{Number(stockDetails.lastSalePrice).toFixed(2)}</div>
                                <div className="info-change">
                                    <span style={{ color: stockDetails.change > 0 ? 'green' : 'red' }}>
                                        {(stockDetails.change > 0 ? '+' : '') + Number(stockDetails.change).toFixed(2)} (
                                    </span>
                                    <span>
                                        <span style={{ color: stockDetails.changePercent > 0 ? 'green' : 'red' }}>
                                            {(stockDetails.changePercent > 0 ? '+' : '') + Number(stockDetails.changePercent).toFixed(2)}%)
                                        </span>
                                    </span>
                                </div>
                                <div className="info-refresh"> Last Updated: {stockDetails.lastUpdated}</div>
                                <div className="info-details">Open: {Number(stockDetails.open).toFixed(2)}</div>
                                <div className="info-details">Close: {Number(stockDetails.close).toFixed(2)}</div>
                                <div className="info-details">High: {Number(stockDetails.high).toFixed(2)}</div>
                                <div className="info-details">Low: {Number(stockDetails.low).toFixed(2)}</div>
                                <div className="info-details">Bid Price: {Number(stockDetails.bidPrice).toFixed(2)}</div>
                                <div className="info-details">Ask Price: {Number(stockDetails.askPrice).toFixed(2)}</div>
                                <div className="info-details">Volume: {stockDetails.volume}</div>

                            </div>
                        ) : (
                            <div className="info-default">a </div>
                        )}
                    </section>
                </div>
                <div className="bottom-bar">
                    Copyright Notice &copy; 2024 Max Wang. All rights reserved.
                </div>
            </div>
        </div>
    );
}

export default Main;