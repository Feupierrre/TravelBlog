import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import { API_BASE_URL, MEDIA_URL } from '../config';
import './HomePage.css'; 

function HomePage() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/posts`)
            .then(res => res.json())
            .then(data => setPosts(data))
            .catch(err => console.error("Error loading posts:", err));
    }, []);

    return (
        <div> 
            <HeroSection />
            <div className="container homepage-container">                
                <h2 className="latest-stories-title">Latest Stories ✍️</h2>
                <div className="posts-grid">
                    {posts.map(post => (
                        <Link key={post.id} to={`/post/${post.slug}`} className="post-card-link">                            
                            <div className="post-card">
                                {post.cover_image_url && (
                                    <img 
                                        src={`${MEDIA_URL}${post.cover_image_url}`} 
                                        alt={post.title} 
                                        className="post-card-img"
                                    />
                                )}
                                <div className="post-card-content">
                                    <span className="post-card-tag">Destination</span>
                                    <h2 className="post-card-title">
                                        {post.title}
                                    </h2>
                                    <p className="post-card-location">
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