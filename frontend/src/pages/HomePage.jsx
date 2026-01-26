import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Импортируем спец-ссылку

function HomePage() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/posts')
            .then(res => res.json())
            .then(data => setPosts(data));
    }, []);

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Мой Тревел Блог ✈️</h1>

            <div style={{ display: 'grid', gap: '20px' }}>
                {posts.map(post => (
                    // Оборачиваем карточку в Link, чтобы она стала кликабельной
                    <Link key={post.id} to={`/post/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            
                        <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <h2>{post.title}</h2>
                            <p style={{ color: '#666' }}>📍 {post.location_name}</p>

                            {post.cover_image_url && (
                                <img 
                                    src={`http://127.0.0.1:8000${post.cover_image_url}`} 
                                    alt={post.title} 
                                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px' }}
                                />
                            )}
                        </div>

                    </Link>
                ))}
            </div>
        </div>
    );
}

export default HomePage;