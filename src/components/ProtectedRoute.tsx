import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogOut } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Cargando...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (userRole === 'pending') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4 text-center">
        <ShieldAlert className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Cuenta Pendiente</h2>
        <p className="text-slate-400 max-w-md mb-8">
          Tu cuenta ha sido creada exitosamente pero está pendiente de aprobación por parte de un Administrador. 
          Una vez que te asignen un rol (ej. Turno 1), podrás acceder al sistema.
        </p>
        <button 
          onClick={() => signOut(auth)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors border border-slate-700 font-medium"
        >
          <LogOut size={18} />
          Volver al Inicio de Sesión
        </button>
      </div>
    );
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
        <p className="text-slate-400 max-w-md mb-8">
          Tu rol actual ({userRole}) no tiene permisos para ver esta pantalla.
        </p>
        <button 
          onClick={() => signOut(auth)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors border border-slate-700 font-medium"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
