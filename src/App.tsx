import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminView } from './pages/AdminView';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { UpdateBanner } from './components/UpdateBanner';

declare const __APP_VERSION__: string;

export default function App() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Definimos una versión por defecto si __APP_VERSION__ no está disponible
    const localVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';
    
    if (localVersion === 'dev') {
      return;
    }

    const checkVersion = async () => {
      try {
        const response = await fetch(`/version.json?t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.version && data.version !== localVersion) {
            setUpdateAvailable(true);
          }
        }
      } catch (err) {
        console.warn('Error al verificar versión:', err);
      }
    };

    // Ejecuta la comprobación al montar
    checkVersion();

    // Comprueba cada 60 segundos
    const interval = setInterval(checkVersion, 60 * 1000);

    // Comprueba al volver a enfocar la pestaña
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      {updateAvailable && <UpdateBanner />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminView />
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute allowedRoles={['admin', 'turno1', 'turno2', 'turno3', 'turno4']}>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}
