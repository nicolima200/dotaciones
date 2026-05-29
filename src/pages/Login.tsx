import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isExpired = sessionStorage.getItem('inactivityLogout');
    if (isExpired === 'true') {
      setError('Tu sesión ha expirado por inactividad.');
      sessionStorage.removeItem('inactivityLogout');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        setError('El email no está registrado o la contraseña es incorrecta. ¿Te has registrado?');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos fallidos. Intenta más tarde.');
      } else {
        setError('Credenciales inválidas o error de conexión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="flex justify-center mb-4">
          {logoError ? (
            <div className="auth-logo">
              <Shield className="w-12 h-12 text-blue-400" />
            </div>
          ) : (
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/8/81/Policia_bonaer_emblem.png"
              alt="Logo Policía PBA"
              className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] object-contain drop-shadow-2xl"
              onError={() => setLogoError(true)}
            />
          )}
        </div>
        <h1 className="auth-title">DOTACIONES UPPL</h1>
        <h2 className="auth-title">Almirante Brown</h2>
        <p className="auth-subtitle">Iniciá sesión para administrar los turnos</p>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="auth-form-group">
            <label className="auth-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              required
            />
          </div>
          <div className="auth-form-group">
            <label className="auth-label">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-auth"
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="auth-link-text">
          ¿No tenés cuenta? <Link to="/register" className="auth-link">Registrate</Link>
        </div>
      </div>
    </div>
  );
};
