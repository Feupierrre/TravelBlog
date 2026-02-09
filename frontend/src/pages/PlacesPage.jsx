import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import './PlacesPage.css';

const CONTINENTS = [
    'All', 
    'Europe', 
    'Asia', 
    'Africa', 
    'North America', 
    'South America', 
    'Oceania', 
    'Antarctica'
];

const PlacesPage = () => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('continent') || 'All';
    const handleTabChange = (continent) => {
        if (continent === 'All') {
            setSearchParams({});
        } else {
            setSearchParams({ continent });
        }
    };

    useEffect(() => {
        setIsLoading(true);
        let url = 'http://127.0.0.1:8000/api/posts';
        if (activeTab !== 'All') {
            url += `?continent=${activeTab}`;
        }

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setPosts(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [activeTab]); 

    return (
        <>
            <Header />
            
            <div className="places-container">
                <div className="places-content">
                    
                    <div className="places-header">
                        <h1 className="places-title">Explore by Region</h1>
                        <p className="places-subtitle">
                            Choose a continent to see stories from that part of the world.
                        </p>
                    </div>
                    <div className="filters-wrapper">
                        {CONTINENTS.map(continent => (
                            <button 
                                key={continent}
                                className={`filter-btn ${activeTab === continent ? 'active' : ''}`}
                                onClick={() => handleTabChange(continent)}
                            >
                                {continent}
                            </button>
                        ))}
                    </div>
                    {isLoading ? (
                        <div style={{textAlign: 'center', padding: '60px', color: '#999', fontSize: '1.2rem'}}>
                            Loading stories...
                        </div>
                    ) : (
                        <div className="places-grid">
                            {posts.length > 0 ? (
                                posts.map(post => (
                                    <Link key={post.id} to={`/post/${post.slug}`} className="place-card">
                                        <div className="place-img-wrapper">
                                            {post.cover_image_url ? (
                                                <img 
                                                    src={`http://127.0.0.1:8000${post.cover_image_url}`} 
                                                    alt={post.title} 
                                                    className="place-img"
                                                />
                                            ) : (
                                                <div className="place-img" style={{background: '#eee'}}></div>
                                            )}
                                            <span className="place-continent-badge">
                                                {post.continent}
                                            </span>
                                        </div>

                                        <div className="place-content">
                                            <div className="place-location">
                                                📍 {post.location_name}
                                            </div>
                                            <h3 className="place-title">{post.title}</h3>
                                            
                                            <div className="place-meta">
                                                <span>by {post.author}</span>
                                                <span>{post.created_at}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <div style={{fontSize: '3rem', marginBottom: '10px'}}>🌍</div>
                                    <h3>No stories in {activeTab} yet.</h3>
                                    <p>Be the first to write about this place!</p>
                                    <Link to="/write" style={{
                                        display: 'inline-block', 
                                        marginTop: '15px', 
                                        color: 'var(--color-primary)', 
                                        fontWeight: 'bold'
                                    }}>
                                        Start Writing →
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PlacesPage;