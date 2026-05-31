import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
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
      
      const isDev = import.meta.env.DEV;
      if (!isDev) {
        await sendEmailVerification(user);
        await auth.signOut();
        alert("Registro exitoso. Se ha enviado un correo de verificación a tu casilla. Por favor verificalo antes de iniciar sesión.");
        navigate('/login');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este email ya está registrado. Por favor, iniciá sesión.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El formato del email no es válido.');
      } else {
        setError('Error al crear la cuenta. Intenta nuevamente.');
      }
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
