import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export type UserRole = 'admin' | 'turno1' | 'turno2' | 'turno3' | 'turno4' | 'pending';

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userRole: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (user) {
        setLoading(true);
        // Escuchar el rol del usuario en tiempo real
        unsubscribeDoc = onSnapshot(doc(db, 'users', user.uid), (userDoc) => {
          if (userDoc.exists()) {
            const rawRole = userDoc.data().role;
            let normalizedRole = 'pending';
            if (rawRole) {
              const strRole = String(rawRole).toLowerCase().replace(/\s+/g, '');
              if (['admin', 'turno1', 'turno2', 'turno3', 'turno4'].includes(strRole)) {
                normalizedRole = strRole;
              }
            }
            setUserRole(normalizedRole as UserRole);
          } else {
            setUserRole('pending');
          }
          setCurrentUser(user);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user role:", error);
          setUserRole('pending');
          setCurrentUser(user);
          setLoading(false);
        });
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userRole, loading }}>
      {!loading ? children : (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
          Cargando aplicación...
        </div>
      )}
    </AuthContext.Provider>
  );
};
