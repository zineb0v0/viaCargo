import React, { useState } from 'react';
import axios from 'axios';
import { FaUser, FaLock } from 'react-icons/fa';
import { GiCardboardBox } from 'react-icons/gi';
import './LoginPage.css';

const API_URL = 'http://localhost:5000/api/auth/login';

const LoginPage = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post(
                API_URL, 
                { email, password },
                { withCredentials: true }
            );
            
            if (response.data.message) {
                onLoginSuccess();
            }
        } catch (err) {
            console.error('Erreur de connexion:', err);
            setError(err.response?.data?.error || 'Échec de la connexion');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <header className="login-header">
                    <div className="icon-container">
                        <GiCardboardBox size={35} color="#9e84b8" />
                    </div>
                    <h1 className="app-name">viaCargo</h1>
                </header>

                <form onSubmit={handleSubmit}>
                    <div className="form-group-login">
                        <label htmlFor="email">Email</label>
                        <div className="input-with-icon">
                            <FaUser className="input-icon" />
                            <input 
                                type="email" 
                                id="email" 
                                placeholder="admin1@viacargo.com"
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-group-login">
                        <label htmlFor="password">Mot de passe</label>
                        <div className="input-with-icon">
                            <FaLock className="input-icon" />
                            <input 
                                type="password" 
                                id="password" 
                                placeholder="adminpass123"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    {error && <p className="login-error">{error}</p>}
                    
                    <button type="submit" className="btn-login" disabled={isLoading}>
                        {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;