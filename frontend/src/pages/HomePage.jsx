import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/posts')
            .then(res => res.json())
            .then(data => setPosts(data));
    }, []);

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                {posts.map(post => (
                    <Link key={post.id} to={`/post/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        
                        <div style={{ 
                            border: '1px solid var(--color-border)', 
                            borderRadius: 'var(--radius-lg)',       
                            backgroundColor: 'var(--color-surface)',
                            overflow: 'hidden',
                            transition: 'transform 0.2s',
                            height: '100%'
                        }}>
                            {post.cover_image_url && (
                                <img 
                                    src={`http://127.0.0.1:8000${post.cover_image_url}`} 
                                    alt={post.title} 
                                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                />
                            )}
                            
                            <div style={{ padding: '20px' }}>
                                <h2 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>{post.title}</h2>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                    📍 {post.location_name}
                                </p>
                            </div>
                        </div>

                    </Link>
                ))}
            </div>
        </div>
    );
}

export default HomePage;