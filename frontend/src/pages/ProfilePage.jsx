import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WorldMap from '../components/WorldMap';
import { API_BASE_URL, MEDIA_URL } from '../config'; // Подключаем конфиг
import './ProfilePage.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [myPosts, setMyPosts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const fetchUserData = (token) => {
        fetch(`${API_BASE_URL}/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            if (!res.ok) throw new Error('Unauthorized');
            return res.json();
        })
        .then(data => {
            setUser(data);
            setBio(data.profile?.bio || data.bio || ''); 
        })
        .catch(() => {
            localStorage.removeItem('accessToken');
            navigate('/login');
        });

        fetch(`${API_BASE_URL}/posts/my-posts`, {
            headers: { 'Authorization': `Bearer ${token}` }       
        })
        .then(res => res.json())
        .then(data => setMyPosts(data))
        .catch(err => console.error("Failed to fetch posts", err));
    };

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchUserData(token);
    }, [navigate]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        const token = localStorage.getItem('accessToken');
        const formData = new FormData();
        formData.append('bio', bio);
        if (avatarFile) formData.append('avatar', avatarFile);

        try {
            const res = await fetch(`${API_BASE_URL}/me/update`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                const updatedData = await res.json();
                setUser(prev => ({
                    ...prev,
                    ...updatedData, 
                    profile: updatedData.profile || updatedData 
                }));
                setIsEditing(false);
                setAvatarFile(null);
                
                if (updatedData.avatar_url) {
                    setAvatarPreview(null); 
                }
            } else {
                alert("Error saving profile");
            }
        } catch (err) { console.error(err); }
    };

    const handleToggleCountry = async (countryCode) => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`${API_BASE_URL}/countries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ country_code: countryCode })
            });
            
            if (res.ok) {
                const data = await res.json();
                if (data.status === 'added') {
                    setUser(prev => ({
                        ...prev,
                        visited_countries: [...prev.visited_countries, data.code],
                        countries_count: prev.countries_count + 1
                    }));
                } else if (data.status === 'removed') {
                    setUser(prev => ({
                        ...prev,
                        visited_countries: prev.visited_countries.filter(c => c !== data.code),
                        countries_count: prev.countries_count - 1
                    }));
                }
            }
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (e, slug) => {
        e.preventDefault(); 
        if(!window.confirm("Are you sure you want to delete this story?")) return;

        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`${API_BASE_URL}/posts/${slug}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const newPosts = myPosts.filter(p => p.slug !== slug);
                setMyPosts(newPosts);
                setUser(prev => ({...prev, stories_count: newPosts.length}));
            } else {
                alert("Failed to delete post");
            }
        } catch (err) {
            console.error(err);
            alert("Network error");
        }
    };

    if (!user) return <div className="profile-loading-screen">Loading...</div>;

    const getAvatarSrc = () => {
        if (avatarPreview) return avatarPreview;
        if (user.avatar_url) return `${MEDIA_URL}${user.avatar_url}`;
        if (user.profile && user.profile.avatar_url) return `${MEDIA_URL}${user.profile.avatar_url}`;
        return null;
    };
    const avatarSrc = getAvatarSrc();

    return (
        <div className="profile-container">
            <div className="profile-content-wrapper">
                <div className="profile-card">
                    <div className="profile-avatar-wrapper">
                        {avatarSrc ? (
                            <img src={avatarSrc} alt="Avatar" className="profile-avatar" />
                        ) : (
                            <div className="profile-avatar-placeholder">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                        {isEditing && (
                            <label className="btn-upload">
                                <span className="material-symbols-outlined upload-icon">photo_camera</span>
                                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                            </label>
                        )}
                    </div>
                    <div className="profile-info">
                        <div className="profile-header">
                            <h1 className="profile-name">{user.username}</h1>
                            {isEditing ? (
                                <button onClick={handleSave} className="btn-edit btn-save">
                                    <span className="material-symbols-outlined action-icon">check</span> Save
                                </button>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="btn-edit">
                                    <span className="material-symbols-outlined action-icon">edit</span> Edit Profile
                                </button>
                            )}
                        </div>
                        {isEditing ? (
                            <textarea 
                                className="bio-input"
                                value={bio} 
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell the world about your travels..."
                            />
                        ) : (
                            <p className="profile-bio">
                                {bio || "No bio yet. Tell us your story!"}
                            </p>
                        )}
                        
                        <p className="profile-email">
                            <span className="material-symbols-outlined email-icon">mail</span> 
                            {user.email}
                        </p>
                    </div>
                    <div className="profile-stats">
                        <div className="stat-item">
                            <span className="stat-value">{user.countries_count || 0}</span>
                            <span className="stat-label">Countries</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{user.stories_count || 0}</span>
                            <span className="stat-label">Stories</span>
                        </div>
                    </div>
                </div>
                
                <h2 className="map-section-title">
                    My Travel Map <span className="section-emoji">🌍</span>
                </h2>
                
                <WorldMap 
                    visitedCodes={user.visited_countries || []} 
                    onCountryClick={handleToggleCountry} 
                />
                <h2 className="stories-section-title">
                    My Stories <span className="section-emoji">✍️</span>
                </h2>
                <div className="stories-grid">
                    {myPosts.length > 0 ? (
                        myPosts.map(post => (
                            <Link key={post.id} to={`/post/${post.slug}`} className="story-card">
                                
                                <button 
                                    className="card-action-btn btn-card-edit"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate(`/edit/${post.slug}`);
                                    }}
                                    title="Edit story"
                                >
                                    <span className="material-symbols-outlined card-action-icon">edit</span>
                                </button>
                                <button 
                                    className="card-action-btn btn-card-delete"
                                    onClick={(e) => handleDelete(e, post.slug)}
                                    title="Delete story"
                                >
                                    <span className="material-symbols-outlined card-action-icon">delete</span>
                                </button>
                                
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
                                        <span className="material-symbols-outlined location-icon">📍</span> 
                                        {post.location_name}
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="no-stories-placeholder">
                            You haven't written any stories yet. <br/>
                            <Link to="/create" className="btn-create-first">Start your first one!</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;