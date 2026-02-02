import { Link, useNavigate } from 'react-router-dom'; 
import { useState, useEffect } from 'react'; 
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));
    const [username, setUsername] = useState(localStorage.getItem('username'));

    useEffect(() => {
        const handleAuthChange = () => {
            setIsAuthenticated(!!localStorage.getItem('accessToken'));
            setUsername(localStorage.getItem('username'));
        };
        window.addEventListener('authChange', handleAuthChange);
        window.addEventListener('storage', handleAuthChange);
        return () => {
            window.removeEventListener('authChange', handleAuthChange);
            window.removeEventListener('storage', handleAuthChange);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
        
        window.dispatchEvent(new Event("authChange"));
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo">
                    <span className="material-symbols-outlined">public</span>
                    TripTales
                </Link>

                <nav className="nav">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/about" className="nav-link">About</Link>
                    <Link to="/places" className="nav-link">Places</Link>
                </nav>

                <div className="auth-buttons">
                    {isAuthenticated ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <Link to="/write" style={{ 
                                display: 'flex', alignItems: 'center', gap: '5px',
                                textDecoration: 'none', color: '#FFFFFF', fontWeight: '600',
                                fontSize: '1rem', textShadow: '0 2px 5px rgba(0,0,0,0.2)'
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>edit_square</span>
                                Write
                            </Link>

                            <Link to="/profile" style={{ fontWeight: 'bold', color: '#4F7942', textDecoration: 'none', fontSize: '1rem' }}>
                                @{username}
                            </Link>

                            <button 
                                onClick={handleLogout} 
                                style={{ 
                                    background: 'none', 
                                    border: '1px solid rgba(255,255,255,0.4)', 
                                    padding: '8px 20px', 
                                    borderRadius: '50px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    color: 'white',
                                    fontWeight: '600',
                                    backdropFilter: 'blur(5px)'
                                }}
                            >
                                Log Out
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="btn-secondary">Log In</Link>
                            <Link to="/register" className="btn-primary">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;