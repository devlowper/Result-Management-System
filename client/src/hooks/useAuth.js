import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await authApi.login(email, password);
        localStorage.setItem('access_token', data.accessToken);
        localStorage.setItem('refresh_token', data.refreshToken);
        set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken, isAuthenticated: true });
        return data.user;
      },

      logout: async () => {
        try {
          await authApi.logout(get().refreshToken);
        } catch {}
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      hasRole: (...roles) => {
        const hierarchy = { superadmin: 3, admin: 2, staff: 1 };
        const userLevel = hierarchy[get().user?.role] || 0;
        return Math.max(...roles.map((r) => hierarchy[r] || 0)) <= userLevel;
      },
    }),
    { name: 'rms-auth', partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }) }
  )
);

export default useAuthStore;
