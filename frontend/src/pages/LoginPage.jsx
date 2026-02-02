import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://127.0.0.1:8000/api/token/pair', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, password})
            });
            
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('accessToken', data.access);
                localStorage.setItem('refreshToken', data.refresh);
                localStorage.setItem('username', username);

                window.dispatchEvent(new Event("authChange"));
                navigate('/');
            } else {
                console.error("Login failed:", data); 
                setError('Incorrect login or password.');
            }
        } catch (err) {
            console.error("Network error:", err);
            setError('Network error. Try again later.');
        }
    };

    return ( 
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Sign in to your account</h1>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Username</label>
                        <input 
                            type="text" 
                            className="form-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required 
                        />
                    </div>
                    {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}
                    <button type="submit" className="auth-btn">Sign In</button>
                </form>
                <div className="auth-footer">
                    Don't have an account?
                    <Link to="/register" className="auth-link">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;