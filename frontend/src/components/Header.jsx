import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react'; 
import './Header.css';

const CONTINENTS = [
    'Europe', 'Asia', 'Africa', 'North America', 'South America', 'Oceania', 'Antarctica'
];

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));
    const [username, setUsername] = useState(localStorage.getItem('username'));
    const [isScrolled, setIsScrolled] = useState(false);
    const lightPages = ['/places', '/write', '/about', '/login', '/register']; 
    const isLightMode = lightPages.some(path => location.pathname.startsWith(path));

    useEffect(() => {
        const handleAuthChange = () => {
            setIsAuthenticated(!!localStorage.getItem('accessToken'));
            setUsername(localStorage.getItem('username'));
        };
        const handleScroll = () => setIsScrolled(window.scrollY > 50);

        window.addEventListener('authChange', handleAuthChange);
        window.addEventListener('storage', handleAuthChange);
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('authChange', handleAuthChange);
            window.removeEventListener('storage', handleAuthChange);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
        window.dispatchEvent(new Event("authChange"));
        navigate('/login');
    };
    const headerClass = `header ${isScrolled ? 'scrolled' : ''} ${isLightMode && !isScrolled ? 'light-mode' : ''}`;

    return (
        <header className={headerClass}>
            <div className="header-container">
                <Link to="/" className="logo">
                    <span className="material-symbols-outlined">public</span>
                    TripTales
                </Link>

                <nav className="nav">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/about" className="nav-link">About</Link>
                    
                    <div className="nav-dropdown">
                        <Link to="/places" className="nav-link dropdown-trigger">
                            Places <span style={{fontSize: '0.8em', marginLeft: '4px'}}>▼</span>
                        </Link>
                        <div className="dropdown-menu">
                            {CONTINENTS.map(c => (
                                <Link key={c} to={`/places?continent=${c}`} className="dropdown-item">
                                    {c}
                                </Link>
                            ))}
                        </div>
                    </div>
                </nav>

                <div className="auth-buttons">
                    {isAuthenticated ? (
                        <div className="user-menu">
                            <Link to="/write" className="link-write">
                                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>edit_square</span>
                                Write
                            </Link>

                            <Link to="/profile" className="link-profile">
                                @{username}
                            </Link>

                            <button onClick={handleLogout} className="btn-logout">
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