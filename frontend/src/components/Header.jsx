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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
    const lightPages = ['/places', '/write', '/about']; 
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
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname, location.search]);
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768 && isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobileMenuOpen]);
    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
        window.dispatchEvent(new Event("authChange"));
        navigate('/login');
    };    
    const headerClass = `header ${isScrolled ? 'scrolled' : ''} ${isLightMode && !isScrolled ? 'light-mode' : ''} ${isMobileMenuOpen ? 'menu-open' : ''}`;

    return (
        <header className={headerClass}>
            <div className="header-container">
                <Link to="/" className="logo">
                    <span className="material-symbols-outlined">public</span>
                    TripTales
                </Link>
                
                <button 
                    className="mobile-menu-btn" 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <span className="material-symbols-outlined">
                        {isMobileMenuOpen ? 'close' : 'menu'}
                    </span>
                </button>
                
                <div className={`menu-wrapper ${isMobileMenuOpen ? 'open' : ''}`}>
                    <nav className="nav">
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/about" className="nav-link">About</Link>
                        
                        <div className="nav-dropdown">
                            <Link to="/places" className="nav-link dropdown-trigger">
                                Places <span className="dropdown-arrow" style={{fontSize: '0.8em', marginLeft: '4px'}}>▼</span>
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
            </div>
        </header>
    );
};

export default Header;