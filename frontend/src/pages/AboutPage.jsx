import React from 'react';
import './AboutPage.css';

import aboutCoverImg from '../assets/about-cover.jpg';
import authorImg from '../assets/author.jpg';

const AboutPage = () => {
    return (
        <div className="about-container">
            <div className="about-content-wrapper">
                <div className="about-header">
                    <h1 className="about-title">About TripTales</h1>
                    <p className="about-subtitle">
                        Exploring the world, one story at a time.
                    </p>
                </div>
                
                <div className="about-hero-image-wrapper">
                    <img 
                        src={aboutCoverImg}
                        alt="Travel moments" 
                        className="about-hero-image"
                    />
                </div>
                
                <div className="about-text-body">
                    <section className="text-section">
                        <h2 className="section-heading-my-story">My Story</h2>
                        <p>
                            Hi, I'm Anatolii! My passion for travel began not at the airport, but on the seashore in my hometown. 
                            From the endless blue sea horizon to the rugged mountain peaks, those first trips sparked a curiosity that has never faded.
                        </p>
                        <p>
                            I haven't visited every country on the map yet—far from it. But that is exactly what excites me. 
                            The world is vast, and I am just getting started. I created TripTales not to show off a completed checklist, 
                            but to document the journey as it happens, one honest story at a time.
                        </p>
                    </section>
                    
                    <section className="text-section">
                        <h2 className="section-heading">About This Blog</h2>
                        <p>
                            TripTales is a platform built for storytellers who value depth over speed. 
                            Here, geography meets narrative.
                        </p>
                        <p><strong>What you'll find here:</strong></p>
                        
                        <ul className="about-list">
                            <li>
                                <strong>Immersive Stories:</strong> Long-form posts that focus on the experience, emotions, and small details.
                            </li>
                            <li>
                                <strong>Interactive Maps:</strong> Every story is pinned to a location, allowing you to explore the world visually.
                            </li>
                            <li>
                                <strong>Zero Distractions:</strong> A clean, minimalist reading experience that puts the content first.
                            </li>
                        </ul>
                    </section>
                    
                    <section className="text-section">
                        <h2 className="section-heading">My Mission</h2>
                        <p>
                            I believe that travel changes us. It opens our minds, challenges our comfort zones, 
                            and connects us with people and cultures we'd otherwise never meet.
                        </p>
                        <p>
                            My mission is simple: <strong>to inspire you to pack your bags and write your own story.</strong> 
                            Whether it's a weekend hike nearby or a grand expedition across continents, the world is waiting for you.
                        </p>
                    </section>
                    <div className="about-author-section">
                        <img 
                            src={authorImg} 
                            alt="Anatolii" 
                            className="about-author-image"
                        />
                        <div className="about-author-info">
                            <h3 className="about-author-name">Anatolii</h3>
                            <p className="about-author-role">Founder & Developer of TripTales</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AboutPage;