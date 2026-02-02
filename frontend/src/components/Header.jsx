import { Link, useNavigate } from 'react-router-dom'; 
import { useState, useEffect } from 'react'; 
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));
    const [username, setUsername] = useState(localStorage.getItem('username'));
    
    // 🔥 Состояние для скролла
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleAuthChange = () => {
            setIsAuthenticated(!!localStorage.getItem('accessToken'));
            setUsername(localStorage.getItem('username'));
        };

        // 🔥 Логика: если прокрутили > 50px, включаем фон
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

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

    return (
        // Добавляем класс 'scrolled' если страница прокручена
        <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
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