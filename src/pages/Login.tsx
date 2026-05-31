import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import logoEscudo from '../assets/escudo_uppl.png';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isExpired = sessionStorage.getItem('inactivityLogout');
    if (isExpired === 'true') {
      setError('Tu sesión ha expirado por inactividad.');
      sessionStorage.removeItem('inactivityLogout');
    }

    const emailSent = sessionStorage.getItem('verificationEmailSent');
    if (emailSent === 'true') {
      setError('Debes verificar tu email antes de iniciar sesión. Hemos enviado un nuevo correo de verificación a tu casilla (revisá también la carpeta de spam o correo no deseado).');
      sessionStorage.removeItem('verificationEmailSent');
    } else if (emailSent === 'error') {
      setError('Debes verificar tu email antes de iniciar sesión. No se pudo enviar el correo de verificación automático, reintenta más tarde.');
      sessionStorage.removeItem('verificationEmailSent');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const isDev = import.meta.env.DEV;
      if (!isDev && !user.emailVerified) {
        try {
          await sendEmailVerification(user);
          sessionStorage.setItem('verificationEmailSent', 'true');
        } catch (sendErr: any) {
          console.error("Error sending verification email on login:", sendErr);
          sessionStorage.setItem('verificationEmailSent', 'error');
        }
        await auth.signOut();
        return;
      }
      navigate('/');
    } catch (err: any) {
      console.error("Login error:", err);
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
          <img
            src={logoEscudo}
            alt="Logo Policía PBA"
            className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] object-contain drop-shadow-2xl"
          />
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
