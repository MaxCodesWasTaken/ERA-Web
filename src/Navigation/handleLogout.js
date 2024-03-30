
const handleLogout = async (navigate) => {
    try {
        const response = await fetch('api/logout', { method: 'POST' });
        if (!response.ok) {
            throw new Error('Logout failed');
        }
        localStorage.removeItem('userToken');
        navigate('/logout');
    } catch (error) {
        console.error('Logout error:', error);
    }
};

export default handleLogout;