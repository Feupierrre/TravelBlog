import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WorldMap from '../components/WorldMap';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ 
        username: '', 
        email: '', 
        stories_count: 0, 
        countries_count: 0,
        visited_countries: [] 
    });

    const fetchUserData = (token) => {
        fetch('http://127.0.0.1:8000/api/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            if (!res.ok) throw new Error('Unauthorized');
            return res.json();
        })
        .then(data => {
            console.log("User data loaded:", data); 
            setUser(data);
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

    const handleToggleCountry = async (countryCode) => {
        const token = localStorage.getItem('accessToken');
        console.log("Sending country to server:", countryCode); // Лог
        
        try {
            const res = await fetch('http://127.0.0.1:8000/api/countries', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ country_code: countryCode })
            });
            
            if (res.ok) {
                console.log("Country updated!");
                fetchUserData(token);
            } else {
                console.error("Server error:", await res.text());
            }
        } catch (err) {
            console.error("Network error:", err);
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '60px', paddingTop: '60px' }}>
            
            <div style={{ 
                marginBottom: '40px', background: 'white', borderRadius: 'var(--radius-lg)', 
                border: '1px solid var(--color-border)', padding: '40px',
                display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap'
            }}>
                <div style={{ 
                    width: '100px', height: '100px', borderRadius: '50%', 
                    background: 'var(--color-primary)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '3rem', fontWeight: '700',
                }}>
                    {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                </div>

                <div style={{ flex: 1 }}>
                    <h1 style={{ marginBottom: '5px', fontSize: '2rem' }}>{user.username}</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Explorer • {user.email}</p>
                </div>

                <div style={{ display: 'flex', gap: '40px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ display: 'block', fontSize: '2rem', fontWeight: '800', color: 'var(--color-text-main)' }}>
                            {user.countries_count}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>COUNTRIES</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ display: 'block', fontSize: '2rem', fontWeight: '800', color: 'var(--color-text-main)' }}>
                            {user.stories_count}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>STORIES</span>
                    </div>
                </div>
            </div>

            {/* Карта */}
            <h2 style={{ marginBottom: '20px' }}>My Travel Map 🌍</h2>
            <WorldMap 
                visitedCodes={user.visited_countries} 
                onCountryClick={handleToggleCountry} 
            />
        </div>
    );
};

export default ProfilePage;