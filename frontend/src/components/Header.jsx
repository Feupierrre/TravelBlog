import { Link, useNavigate } from 'react-router-dom'; 
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    
    const isAuthenticated = !!localStorage.getItem('accessToken');
    const username = localStorage.getItem('username');

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
        
        window.location.reload(); 
    };

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo">
                    <span className="material-symbols-outlined">travel_explore</span>
                    TravelBlog
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
                                textDecoration: 'none', color: 'var(--color-text-main)', fontWeight: '600',
                                fontSize: '0.95rem'
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit_square</span>
                                Write
                            </Link>
                            <Link to="/profile" style={{ fontWeight: 'bold', color: 'var(--color-primary)', textDecoration: 'none' }}>
                                @{username}
                            </Link>
                            <button 
                                onClick={handleLogout} 
                                style={{ 
                                    background: 'none', 
                                    border: '1px solid var(--color-border)', 
                                    padding: '8px 16px', 
                                    borderRadius: '50px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    color: 'var(--color-text-muted)'
                                }}
                            >
                                Log Out
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn-login">Sign In</Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;