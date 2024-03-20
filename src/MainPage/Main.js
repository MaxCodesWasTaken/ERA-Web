import React, { useState, useEffect } from 'react'; // Import useEffect here
import './Main.css';
function Main() {
    const [searchTerm, setSearchTerm] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Current date in YYYY-MM-DD format
    const [importance, setImportance] = useState('All Stocks');
    const [stocks, setStocks] = useState([]);
    const [stockDetails, setStockDetails] = useState(null);
    const [noOCHLData, setNoOCHLData] = useState(new Set()); // To track symbols with no OCHL data
    const [checkedStocks, setCheckedStocks] = useState({});
    const [filteredStocks, setFilteredStocks] = useState([]);

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
        getStock(searchTerm);
    };

    const filterResults = () => {
        const filtered = stocks.filter(stock => {
            const matchesDate = stock.earningsDate === date;
            let matchesImportance = true;
            if (importance !== 'All Stocks') {
                if (importance === '3 and above') {
                    matchesImportance = parseInt(stock.importance) >= 3;
                } else if (importance === 'Market Movers') {
                    matchesImportance = parseInt(stock.importance) === 5;
                }
            }

            return matchesDate && matchesImportance;
        });

        setFilteredStocks(filtered);
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
                for (const stock of dateEarnings.stocks) {
                    const { symbol, title, date: earningsDate, time, importance } = stock;
                    allEarningsData.push({ symbol, title, earningsDate, time, importance });
                }
            }

            setStocks(allEarningsData);
            setFilteredStocks(allEarningsData);  // Initialize filteredStocks with all stocks
        } catch (error) {
            console.error("Unable to get earnings calendar", error);
        }
    };
    const getStock = async (symbol) => {
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

        fetch(`https://api.iex.cloud/v1/data/core/iex_tops/${symbol}?token=pk_5eb2e76ca8544c9ab0b0115b4fbc1f75`)
            .then(response => response.json())
            .then(data => {
                const stockData = data[0] || {}; // Assuming the first object is what we need

                const { bidPrice, askPrice, lastSalePrice, volume } = stockData;
                const change = lastSalePrice - sOCHL.close;
                const changePercent = (change / sOCHL.close) * 100;

                setStockDetails({
                    symbol,
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
                    lastUpdated: new Date().toLocaleString() // Simplified date handling
                });
            })
            .catch(error => {
                console.error("Failed to retrieve stock data", error);
            });
    };
    const fetchStockOCHL = async (symbol) => {
        // Implement fetching of OCHL data for the symbol
        const uri = `https://api.polygon.io/v2/aggs/ticker/`+symbol+`/prev?adjusted=true&apiKey=kXovlxMMEqF0izpuvLEUUBWlc9KspgpA`;
        try {
            const response = await fetch(uri);
            const data = await response.json();
            const results = data.results[0] || {};

            return {
                open: results.o,
                close: results.c,
                high: results.h,
                low: results.l
            };
        } catch (error) {
            console.error("Unable to get stock OCHL data for", symbol, error);
            return null;
        }
    };
    const handleLogout = () => {
        // Clear user session/token
        localStorage.removeItem('userToken'); // Adjust based on where you store your token/session data

        // Redirect to login page or home page
        window.location.href = '/login'; // Adjust the URL based on your routing setup
    };
    return (

        <div className="App">
            <header className="app-header">
                <h1>Earnings Report Action</h1>
                <div className="window-controls">
                    <button onClick={handleLogout} className="logout-button" title="Logout">Logout</button>
                </div>
            </header>
            <div className="app-container">
                <div className="sidebar">
                    <div className="stock-list-container">
                        <div className="stock-list">
                            {filteredStocks.map((stock, index) => (
                                <div key={index} className="stock-item" onClick={() => getStock(stock.symbol)}>
                                    <div className = "sidebar-symbol">{stock.symbol}</div>
                                    <div className = "sidebar-title">{stock.title}</div>
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
                                <div className = "info-refresh"> Last Updated: {stockDetails.lastUpdated}</div>
                                <div className = "info-details">Open: {Number(stockDetails.open).toFixed(2)}</div>
                                <div className = "info-details">Close: {Number(stockDetails.close).toFixed(2)}</div>
                                <div className = "info-details">High: {Number(stockDetails.high).toFixed(2)}</div>
                                <div className = "info-details">Low: {Number(stockDetails.low).toFixed(2)}</div>            
                                <div className = "info-details">Bid Price: {Number(stockDetails.bidPrice).toFixed(2)}</div>
                                <div className = "info-details">Ask Price: {Number(stockDetails.askPrice).toFixed(2)}</div>
                                <div className = "info-details">Volume: {stockDetails.volume}</div>
                                
                            </div>
                        ) : (
                        <div className="info-details">Select a stock to view details.</div>
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