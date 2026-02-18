import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WorldMap from '../components/WorldMap';
import './ProfilePage.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [myPosts, setMyPosts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Базовый URL API (лучше вынести в отдельный конфиг)
    const API_URL = 'http://127.0.0.1:8000/api';

    const fetchUserData = (token) => {
        // 1. Получаем профиль
        fetch(`${API_URL}/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            if (!res.ok) throw new Error('Unauthorized');
            return res.json();
        })
        .then(data => {
            setUser(data);
            setBio(data.profile?.bio || data.bio || ''); // Учитываем разную вложенность
        })
        .catch(() => {
            localStorage.removeItem('accessToken');
            navigate('/login');
        });

        // 2. Получаем посты (ИСПРАВЛЕН URL)
        fetch(`${API_URL}/posts/my-posts`, {
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
            const res = await fetch(`${API_URL}/me/update`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                // Обновляем данные пользователя без перезагрузки страницы
                const updatedData = await res.json();
                setUser(prev => ({
                    ...prev,
                    // Обновляем поля, которые пришли с сервера
                    ...updatedData, 
                    // Если сервер возвращает profile внутри, обновляем и его
                    profile: updatedData.profile || updatedData 
                }));
                setIsEditing(false);
                setAvatarFile(null);
                
                // Если аватар обновился, сбрасываем превью
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
            // Обрати внимание: этот роутер должен быть подключен в blog/api/__init__.py
            const res = await fetch(`${API_URL}/countries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ country_code: countryCode })
            });
            
            if (res.ok) {
                // Обновляем только список стран, чтобы не дергать весь профиль
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
            const res = await fetch(`${API_URL}/posts/${slug}`, {
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

    if (!user) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F7F4', color: '#222' }}>Loading...</div>;

    // Логика отображения аватара
    const getAvatarSrc = () => {
        if (avatarPreview) return avatarPreview;
        // Проверяем разные варианты, где может лежать URL аватара
        if (user.avatar_url) return `http://127.0.0.1:8000${user.avatar_url}`;
        if (user.profile && user.profile.avatar_url) return `http://127.0.0.1:8000${user.profile.avatar_url}`;
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
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>photo_camera</span>
                                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                            </label>
                        )}
                    </div>

                    <div className="profile-info">
                        <div className="profile-header">
                            <h1 className="profile-name">{user.username}</h1>
                            {isEditing ? (
                                <button onClick={handleSave} className="btn-edit btn-save">
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check</span> Save
                                </button>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="btn-edit">
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span> Edit Profile
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
                            <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '5px' }}>mail</span> 
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
                    My Travel Map <span style={{ fontSize: '1.5rem', marginLeft: '10px' }}>🌍</span>
                </h2>
                
                <WorldMap 
                    visitedCodes={user.visited_countries || []} 
                    onCountryClick={handleToggleCountry} 
                />
                
                <h2 className="stories-section-title">
                    My Stories <span style={{ fontSize: '1.5rem', marginLeft: '10px'}}>✍️</span>
                </h2>
                
                <div className="stories-grid">
                    {myPosts.length > 0 ? (
                        myPosts.map(post => (
                            <Link key={post.id} to={`/post/${post.slug}`} className="story-card" style={{position: 'relative'}}>
                                
                                <button 
                                    className="card-action-btn btn-card-edit"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate(`/edit/${post.slug}`);
                                    }}
                                    title="Edit story"
                                >
                                    <span className="material-symbols-outlined" style={{fontSize: '18px'}}>edit</span>
                                </button>
                                <button 
                                    className="card-action-btn btn-card-delete"
                                    onClick={(e) => handleDelete(e, post.slug)}
                                    title="Delete story"
                                >
                                    <span className="material-symbols-outlined" style={{fontSize: '18px'}}>delete</span>
                                </button>
                                {post.cover_image_url ? (
                                    <img 
                                        src={`http://127.0.0.1:8000${post.cover_image_url}`} 
                                        alt={post.title} 
                                        className="story-card-image"
                                    />
                                ) : (
                                    <div className="story-card-image" style={{background: '#eee'}}></div>
                                )}
                                
                                <div className="story-card-content">
                                    <span className="story-card-tag">DESTINATION</span>
                                    <h3 className="story-card-title">{post.title}</h3>
                                    <div className="story-card-location">
                                        <span className="material-symbols-outlined" style={{fontSize: '16px'}}> 📍 </span> 
                                        {post.location_name}
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="no-stories-placeholder">
                            You haven't written any stories yet. <br/>
                            <Link to="/create" style={{color: '#4F7942', fontWeight: 'bold', marginTop: '10px', display: 'inline-block'}}>Start your first one!</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;