import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
    return (
        <header className="header">
            <div className="header-container">
                {/* Логотип */}
                <Link to="/" className="logo">
                    <span className="material-symbols-outlined">travel_explore</span>
                    TravelBlog
                </Link>

                {/* Меню */}
                <nav className="nav">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/about" className="nav-link">About</Link>
                    <Link to="/places" className="nav-link">Places</Link>
                </nav>

                {/* Кнопка входа */}
                <div className="auth-buttons">
                    <Link to="/login" className="btn-login">Sign In</Link>
                </div>
            </div>
        </header>
    );
};

export default Header;