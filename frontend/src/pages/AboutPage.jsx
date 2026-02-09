import React from 'react';
import { Link } from 'react-router-dom';
import './AboutPage.css';

import aboutCoverImg from '../assets/about-cover.jpg';
import authorImg from '../assets/author.jpg';

const AboutPage = () => {
    return (
        <div className="about-container">
            <div className="about-content-wrapper">
                
                {/* 1. ГЛАВНЫЙ ЗАГОЛОВОК */}
                <div className="about-header">
                    <h1 className="about-title">About TripTales</h1>
                    <p className="about-subtitle">
                        Exploring the world, one story at a time.
                    </p>
                </div>

                {/* 2. БОЛЬШОЕ ФОТО */}
                <div className="about-hero-image-wrapper">
                    <img 
                        src={aboutCoverImg}
                        alt="Travel moments" 
                        className="about-hero-image"
                    />
                </div>

                {/* 3. ТЕКСТОВАЯ КАРТОЧКА */}
                <div className="about-text-body">
                    
                    {/* Секция: Моя история (Расширенная) */}
                    <section className="text-section">
                        <h2 className="section-heading-my-story ">My Story</h2>
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

                    {/* Секция: О блоге */}
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


                    {/* Секция: Миссия */}
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

                    {/* БЛОК АВТОРА */}
                    <div style={{ marginTop: '60px', display: 'flex', alignItems: 'center', gap: '20px', borderTop: '2px solid #eee', paddingTop: '40px' }}>
                        <img 
                            src={authorImg} 
                            alt="Anatolii" 
                            style={{ 
                                width: '90px', 
                                height: '90px', 
                                borderRadius: '50%', 
                                objectFit: 'cover',
                                border: '2px solid #1A1A1A', /* Рамка для аватарки */
                                boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                            }} 
                        />
                        <div>
                            <h3 style={{ fontSize: '1.4rem', marginBottom: '5px', fontFamily: 'var(--font-sans)', fontWeight: '800', color: '#1A1A1A' }}>
                                Anatolii
                            </h3>
                            <p style={{ color: '#555', fontSize: '1rem', fontStyle: 'italic' }}>
                                Founder & Developer of TripTales
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AboutPage;