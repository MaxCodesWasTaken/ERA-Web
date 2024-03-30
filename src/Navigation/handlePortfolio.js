const handlePortfolio = (navigate) => {
    fetch('/api/portfolio', {
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

export default handlePortfolio;