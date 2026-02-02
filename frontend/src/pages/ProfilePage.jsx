import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WorldMap from '../components/WorldMap';
import './ProfilePage.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const fetchUserData = (token) => {
        fetch('http://127.0.0.1:8000/api/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            if (!res.ok) throw new Error('Unauthorized');
            return res.json();
        })
        .then(data => {
            setUser(data);
            setBio(data.bio || '');
        })
        .catch(() => {
            localStorage.removeItem('accessToken');
            navigate('/login');
        });
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
            const res = await fetch('http://127.0.0.1:8000/api/me/update', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setUser(updatedUser);
                setIsEditing(false);
                setAvatarFile(null);
            } else {
                alert("Error saving");
            }
        } catch (err) { console.error(err); }
    };

    const handleToggleCountry = async (countryCode) => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch('http://127.0.0.1:8000/api/countries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ country_code: countryCode })
            });
            if (res.ok) fetchUserData(token);
        } catch (err) { console.error(err); }
    };

    if (!user) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1A251C', color: 'white' }}>Loading...</div>;

    const avatarUrl = avatarPreview 
        ? avatarPreview 
        : (user.avatar_url ? `http://127.0.0.1:8000${user.avatar_url}` : null);

    return (
        <div className="profile-container">
            <div className="profile-content-wrapper">
                <div className="profile-card">
                    <div className="profile-avatar-wrapper">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="profile-avatar" />
                        ) : (
                            <div className="profile-avatar">
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
                                {user.bio || "No bio yet. Tell us your story!"}
                            </p>
                        )}
                        
                        <p className="profile-email">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>mail</span> {user.email}
                        </p>
                    </div>

                    <div className="profile-stats">
                        <div className="stat-item">
                            <span className="stat-value">{user.countries_count}</span>
                            <span className="stat-label">Countries</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{user.stories_count}</span>
                            <span className="stat-label">Stories</span>
                        </div>
                    </div>
                </div>

                {/* КАРТА */}
                <h2 className="map-section-title">
                    My Travel Map <span style={{ fontSize: '1.5rem', marginLeft: '10px' }}>🌍</span>
                </h2>
                
                <WorldMap 
                    visitedCodes={user.visited_countries} 
                    onCountryClick={handleToggleCountry} 
                />
            </div>
        </div>
    );
};

export default ProfilePage;