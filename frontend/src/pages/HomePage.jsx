import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection'; // <-- 1. Импортируем компонент

function HomePage() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/posts')
            .then(res => res.json())
            .then(data => setPosts(data));
    }, []);

    return (
        <div> 
            {/* 2. Вставляем Hero Section на всю ширину (он сам внутри имеет контейнер) */}
            <HeroSection />

            <div className="container" style={{ paddingBottom: '60px' }}>
                
                {/* Заголовок секции */}
                <h2 style={{ marginBottom: '30px', fontSize: '2rem', marginTop: '40px' }}>Latest Stories ✍️</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                    {posts.map(post => (
                        <Link key={post.id} to={`/post/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            
                            {/* Карточка поста: Обновленный дизайн */}
                            <div style={{ 
                                border: '1px solid var(--color-border)', 
                                borderRadius: 'var(--radius-lg)',       
                                backgroundColor: 'var(--color-surface)',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                            // Добавляем эффект при наведении через inline-события (или лучше через CSS, но пока так)
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {post.cover_image_url && (
                                    <img 
                                        src={`http://127.0.0.1:8000${post.cover_image_url}`} 
                                        alt={post.title} 
                                        style={{ width: '100%', height: '240px', objectFit: 'cover' }}
                                    />
                                )}
                                
                                <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    {/* Маленькая метка над заголовком */}
                                    <span style={{ 
                                        fontSize: '0.75rem', 
                                        fontWeight: '700', 
                                        color: 'var(--color-primary)', 
                                        textTransform: 'uppercase', 
                                        letterSpacing: '1px',
                                        marginBottom: '8px',
                                        display: 'block'
                                    }}>
                                        Destination
                                    </span>

                                    <h2 style={{ fontSize: '1.4rem', marginBottom: '10px', lineHeight: '1.3' }}>
                                        {post.title}
                                    </h2>
                                    
                                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: 'auto' }}>
                                        📍 {post.location_name}
                                    </p>
                                </div>
                            </div>

                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HomePage;