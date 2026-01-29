import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WorldMap from '../components/WorldMap';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    
    // Состояния для редактирования
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
            setBio(data.bio || ''); // Заполняем био, если оно есть
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

    // Обработка выбора файла (показываем превью сразу)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    // Сохранение профиля
    const handleSave = async () => {
        const token = localStorage.getItem('accessToken');
        const formData = new FormData();
        
        formData.append('bio', bio);
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        try {
            const res = await fetch('http://127.0.0.1:8000/api/me/update', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData // 👈 Важно: отправляем как FormData (для файлов)
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setUser(updatedUser);
                setIsEditing(false); // Выходим из режима редактирования
                setAvatarFile(null); // Очищаем файл
            } else {
                alert("Ошибка при сохранении");
            }
        } catch (err) {
            console.error(err);
        }
    };
    
    // Тоггл стран (оставляем как было)
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

    if (!user) return <div className="container" style={{padding: '50px'}}>Loading...</div>;

    // Определяем URL аватарки (приоритет: превью -> с сервера -> заглушка)
    const avatarUrl = avatarPreview 
        ? avatarPreview 
        : (user.avatar_url ? `http://127.0.0.1:8000${user.avatar_url}` : null);

    return (
        <div className="container" style={{ paddingBottom: '60px', paddingTop: '40px' }}>
            
            {/* КАРТОЧКА ПРОФИЛЯ */}
            <div style={{ 
                marginBottom: '40px', background: 'white', borderRadius: '16px', 
                border: '1px solid #E8ECE8', padding: '40px',
                display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap'
            }}>
                
                {/* 1. АВАТАРКА */}
                <div style={{ position: 'relative' }}>
                    <div style={{ 
                        width: '120px', height: '120px', borderRadius: '50%', 
                        background: avatarUrl ? `url(${avatarUrl}) center/cover` : 'var(--color-primary)', 
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '3rem', fontWeight: '700', border: '4px solid white',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                    }}>
                        {!avatarUrl && user.username.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Кнопка загрузки фото (появляется только при редактировании) */}
                    {isEditing && (
                        <label style={{ 
                            position: 'absolute', bottom: '0', right: '0',
                            background: 'var(--color-text-main)', color: 'white',
                            width: '32px', height: '32px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>photo_camera</span>
                            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                        </label>
                    )}
                </div>

                {/* 2. ИНФОРМАЦИЯ */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h1 style={{ fontSize: '2.2rem', margin: 0 }}>{user.username}</h1>
                        
                        {/* КНОПКА EDIT / SAVE */}
                        {isEditing ? (
                            <button onClick={handleSave} style={{ 
                                padding: '8px 20px', background: 'var(--color-primary)', color: 'white', 
                                border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' 
                            }}>
                                Save Profile
                            </button>
                        ) : (
                            <button onClick={() => setIsEditing(true)} style={{ 
                                padding: '8px 20px', background: 'white', color: 'var(--color-text-main)', 
                                border: '1px solid #ddd', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '5px'
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span> Edit
                            </button>
                        )}
                    </div>

                    {/* Поле Bio */}
                    {isEditing ? (
                        <textarea 
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                            style={{ 
                                width: '100%', minHeight: '80px', padding: '10px', 
                                borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit',
                                fontSize: '1rem', resize: 'vertical'
                            }}
                        />
                    ) : (
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '600px' }}>
                            {user.bio || "No bio yet. Click edit to tell your story!"}
                        </p>
                    )}
                    
                    <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#999' }}>{user.email}</p>
                </div>

                {/* 3. СТАТИСТИКА */}
                <div style={{ display: 'flex', gap: '30px', borderLeft: '1px solid #eee', paddingLeft: '30px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ display: 'block', fontSize: '2rem', fontWeight: '800', color: 'var(--color-text-main)' }}>
                            {user.countries_count}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', letterSpacing: '1px' }}>COUNTRIES</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ display: 'block', fontSize: '2rem', fontWeight: '800', color: 'var(--color-text-main)' }}>
                            {user.stories_count}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', letterSpacing: '1px' }}>STORIES</span>
                    </div>
                </div>
            </div>

            <h2 style={{ marginBottom: '20px' }}>My Travel Map 🌍</h2>
            <WorldMap 
                visitedCodes={user.visited_countries} 
                onCountryClick={handleToggleCountry} 
            />
        </div>
    );
};

export default ProfilePage;