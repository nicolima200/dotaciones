import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ShieldCheck, Users, Database } from 'lucide-react';
import { UserRole } from '../context/AuthContext';
import { defaultState } from '../store';

interface UserData {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export const AdminView: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData: UserData[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as UserData);
      });
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole
      });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Error al actualizar el rol");
    }
  };

  const handleMigration = async () => {
    if (!window.confirm("¿Estás seguro de migrar los datos locales a Firebase? Esto sobrescribirá los datos actuales en la base de datos.")) return;
    setMigrating(true);
    try {
      await setDoc(doc(db, 'state', 'main'), defaultState);
      alert("Datos migrados exitosamente a Firebase.");
    } catch (e) {
      console.error(e);
      alert("Error al migrar los datos.");
    } finally {
      setMigrating(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-white">Cargando usuarios...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
            <p className="text-slate-400">Gestioná los accesos y roles de los usuarios del sistema</p>
          </div>
        </div>
        <button 
          onClick={handleMigration} 
          disabled={migrating}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Database size={18} />
          {migrating ? 'Migrando...' : 'Subir Datos a Firebase'}
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-400" />
          <h2 className="font-medium text-white">Usuarios Registrados</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-900/50 text-slate-400">
              <tr>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Fecha de Registro</th>
                <th className="px-6 py-4">Estado / Rol</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                  <td className="px-6 py-4 font-medium text-white">{user.email}</td>
                  <td className="px-6 py-4">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Desconocida'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                      user.role === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      className="bg-slate-900 border border-slate-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="turno1">Turno 1</option>
                      <option value="turno2">Turno 2</option>
                      <option value="turno3">Turno 3</option>
                      <option value="turno4">Turno 4</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    No hay usuarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
