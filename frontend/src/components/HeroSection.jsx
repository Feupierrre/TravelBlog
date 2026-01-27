import { Link } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
    return (
        <div className="container">
            <section className="hero">
                <div className="hero-bg"></div>
                
                <div className="hero-content">
                    <span className="hero-subtitle">The Editorial</span>
                    
                    <h1 className="hero-title">
                        The Art of <br />
                        <span>Slow Travel</span>
                    </h1>
                    
                    <p className="hero-desc">
                        Immerse yourself in the journey, not just navigate.
                        Discover the world one story at a time.
                    </p>
                    
                    <Link to="/about" className="hero-btn">
                        Start Exploring 
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default HeroSection;