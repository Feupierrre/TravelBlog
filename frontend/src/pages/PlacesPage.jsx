import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { API_BASE_URL, MEDIA_URL } from '../config'; 
import './PlacesPage.css';

const CONTINENTS = [
    'All', 'Europe', 'Asia', 'Africa', 'North America', 'South America', 'Oceania', 'Antarctica'
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
        let url = `${API_BASE_URL}/posts`;
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
                        <div className="places-loading-state">
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
                                                    src={`${MEDIA_URL}${post.cover_image_url}`} 
                                                    alt={post.title} 
                                                    className="place-img"
                                                />
                                            ) : (
                                                <div className="place-img-placeholder"></div>
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
                                    <div className="empty-state-icon">🌍</div>
                                    <h3>No stories in {activeTab} yet.</h3>
                                    <p>Be the first to write about this place!</p>
                                    <Link to="/write" className="empty-state-link">
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