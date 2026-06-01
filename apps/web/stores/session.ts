import { create } from 'zustand'

interface SessionStore {
  user: any | null
  isAuthenticated: boolean
  setUser: (user: any) => void
  clearUser: () => void
}

export const useSessionStore = create<SessionStore>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}))
