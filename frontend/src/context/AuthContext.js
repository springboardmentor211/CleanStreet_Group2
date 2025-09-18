import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Try to get cached user data from localStorage
    const cachedUser = localStorage.getItem('user');
    return cachedUser ? JSON.parse(cachedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  const updateUser = useCallback((newData) => {
    console.log('AuthContext: Updating user data:', newData);
    if (newData) {
      // Ensure we're not storing undefined values
      const cleanedData = {
        // _id: newData._id,
        // name: newData.name || '',
        // username: newData.username || '',
        // email: newData.email || '',
        // phone: newData.phone || '',
        // address: newData.address || '',
        // bio: newData.bio || '',
        // profilePicture: newData.profilePicture || null,
        // role: newData.role || 'user',
        // createdAt: newData.createdAt,
        // updatedAt: newData.updatedAt
         ...newData, // spread everything (bio, username, profilePicture, etc.)
        _id: newData._id || newData.id, // normalize _id/id field
      };
      
      console.log('AuthContext: Cleaned user data:', cleanedData);
      setUser(cleanedData);
      localStorage.setItem('user', JSON.stringify(cleanedData));
    } else {
      console.log('AuthContext: Clearing user data');
      setUser(null);
      localStorage.removeItem('user');
    }
  }, []); // No dependencies needed as it only uses setState

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setUser(null);
  }, []); // No dependencies needed

  // Memoize fetchUser to prevent infinite re-renders
  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        updateUser(null);
        return;
      }

      const res = await api.get('/users/me');
      updateUser(res.data);
    } catch (err) {
      console.error('Error fetching user:', err);
      updateUser(null);
    } finally {
      setLoading(false);
    }
  }, [updateUser]); // Include updateUser as a dependency

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, loading, updateUser, fetchUser, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
