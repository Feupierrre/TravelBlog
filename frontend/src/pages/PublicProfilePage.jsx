import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import WorldMap from '../components/WorldMap';
import { API_BASE_URL, MEDIA_URL } from '../config'; 
import './ProfilePage.css';

const PublicProfilePage = () => {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await fetch(`${API_BASE_URL}/users/${username}`);
                if (!userRes.ok) throw new Error('User not found');
                const userData = await userRes.json();
                setProfile(userData);
                const postsRes = await fetch(`${API_BASE_URL}/posts?author=${username}`);
                const postsData = await postsRes.json();
                setPosts(postsData);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [username]);

    if (isLoading) return <div className="profile-loading-screen">Loading...</div>;
    if (!profile) return (
        <div className="profile-container">
            <Header />
            <div className="profile-content-wrapper user-not-found-wrapper">
                <h2>User not found 😔</h2>
                <Link to="/" className="go-home-link">Go Home</Link>
            </div>
        </div>
    );

    const visitedCountriesList = profile.visited_countries || profile.visitedCountries || [];
    
    return (
        <div className="profile-container">
            <Header />
            <div className="profile-content-wrapper">
                <div className="profile-card">
                    <div className="profile-avatar-wrapper">
                        {profile.avatar_url ? (
                            <img 
                                src={`${MEDIA_URL}${profile.avatar_url}`} 
                                alt={profile.username} 
                                className="profile-avatar" 
                            />
                        ) : (
                            <div className="profile-avatar-placeholder">
                                {profile.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="profile-info">
                        <div className="profile-header">
                            <h1 className="profile-name">{profile.username}</h1>
                        </div>
                        <p className="profile-bio">
                            {profile.bio || "This traveler hasn't written a bio yet."}
                        </p>
                    </div>
                    <div className="profile-stats">
                        <div className="stat-item">
                            <span className="stat-value">{profile.countries_count}</span>
                            <span className="stat-label">Countries</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{profile.stories_count}</span>
                            <span className="stat-label">Stories</span>
                        </div>
                    </div>
                </div>
                <div className="map-section">
                    <h2 className="map-section-title">
                        Travel Map <span className="section-emoji">🌍</span>
                    </h2>
                    <div className="map-wrapper">
                        <WorldMap visitedCodes={visitedCountriesList} />
                    </div>
                </div>
                <div className="stories-section">
                    <h2 className="stories-section-title">
                        Trip Stories <span className="section-emoji">✍️</span>
                    </h2>
                    {posts.length === 0 ? (
                        <div className="no-stories-placeholder">
                            No stories published yet.
                        </div>
                    ) : (
                        <div className="stories-grid">
                            {posts.map(post => (
                                <Link to={`/post/${post.slug}`} key={post.id} className="story-card">
                                    {post.cover_image_url ? (
                                        <img 
                                            src={`${MEDIA_URL}${post.cover_image_url}`} 
                                            alt={post.title} 
                                            className="story-card-image" 
                                        />
                                    ) : (
                                        <div className="story-card-image placeholder-bg"></div>
                                    )}
                                    <div className="story-card-content">
                                        <span className="story-card-tag">DESTINATION</span>
                                        <h3 className="story-card-title">{post.title}</h3>
                                        <div className="story-card-location">
                                            <span className="material-symbols-outlined location-icon">location_on</span>
                                            {post.location_name}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicProfilePage;