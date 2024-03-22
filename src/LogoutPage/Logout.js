import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout({ onLogout }) {
    const navigate = useNavigate();

    useEffect(() => {
        const performLogout = async () => {
            await onLogout(); // Call the logout function passed as a prop
            navigate('/'); // Redirect to the home page after logout
        };

        performLogout();
    }, [onLogout, navigate]);

    // Render nothing or a loading indicator
    return (<div>Logging out...</div>);
}

export default Logout;