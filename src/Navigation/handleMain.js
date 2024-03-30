const handleMain = (navigate) => {
    fetch('/api/main', {
        method: 'GET',
    })
        .then(response => {
            if (response.ok) {
                return response.json();
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
};

export default handleMain;