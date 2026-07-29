import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role } from '@/types/common'
import { STORAGE_KEYS } from '@/services/storage/storageKeys'

interface RoleState {
  role: Role
  setRole: (role: Role) => void
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: 'client',
      setRole: (role) => set({ role }),
    }),
    { name: STORAGE_KEYS.role },
  ),
)
