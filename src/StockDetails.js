import React from 'react';

function StockDetails({ stockData }) {
    if (!stockData) {
        return <div>Select a stock to see details.</div>;
    }

    // Display stock details like open, close, high, low, etc.
    return (
        <div>
            <h3>{stockData.symbol}</h3>
            <div>Open: {stockData.open}</div>
            <div>Close: {stockData.close}</div>
      // Add other details similarly
        </div>
    );
}

export default StockDetails;