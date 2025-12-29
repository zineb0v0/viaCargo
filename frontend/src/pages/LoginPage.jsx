import React, { useState } from 'react';
import axios from 'axios';
import { FaUser, FaLock } from 'react-icons/fa';
import { GiCardboardBox } from 'react-icons/gi';
import './LoginPage.css';

// URL de votre backend
const API_URL = 'http://localhost:5000/login';

const LoginPage = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // --- SIMULATION POUR LE TEST (admin/admin) ---
        if (username === 'admin' && password === 'admin') {
            setIsLoading(false);
            onLoginSuccess();
            return;
        }
        // -----------------------------------------

        try {
            // Tentative de connexion via API Flask
            const response = await axios.post(API_URL, { username, password });
            
            if (response.data.token) {
                // Si l'API retourne un token, la connexion est réussie
                onLoginSuccess();
            } else {
                setError('Identifiants incorrects.');
            }
        } catch (err) {
            console.error('Erreur de connexion:', err);
            // Afficher une erreur si l'API est injoignable ou renvoie 401/400
            setError('Échec de la connexion. Vérifiez le backend ou utilisez admin/admin.');
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
                        <label htmlFor="username">Nom d'utilisateur</label>
                        <div className="input-with-icon">
                            <FaUser className="input-icon" />
                            <input 
                                type="text" 
                                id="username" 
                                placeholder="Entrez votre nom d'utilisateur"
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
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
                                placeholder="Entrez votre mot de passe"
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