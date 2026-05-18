import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Add user to firestore with pending role
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'pending',
        createdAt: new Date().toISOString()
      });
      
      navigate('/');
    } catch (err: any) {
      setError('Error al registrar usuario: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container register">
      <div className="auth-card register">
        <div className="auth-logo register">
          <Shield className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="auth-title">Crear Cuenta</h2>
        <p className="auth-subtitle">Registrate y espera aprobación del Administrador</p>
        
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="auth-form-group">
            <label className="auth-label">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input register"
              required
            />
          </div>
          <div className="auth-form-group">
            <label className="auth-label">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input register"
              required
              minLength={6}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-auth register"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        
        <div className="auth-link-text">
          ¿Ya tenés cuenta? <Link to="/login" className="auth-link register">Iniciar Sesión</Link>
        </div>
      </div>
    </div>
  );
};
