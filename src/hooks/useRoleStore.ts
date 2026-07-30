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
    {
      name: STORAGE_KEYS.role,
      // Only the client role is selectable now, and it carries the review
      // capabilities. Browsers that persisted 'consultant' from an earlier
      // build are normalized on load, otherwise they would keep showing the
      // old label and stay locked out of the client-gated upload/submit paths.
      // `migrate` rewrites the stored value; `merge` guarantees the in-memory
      // value is correct even before that write lands.
      version: 1,
      migrate: (persisted) => ({ ...(persisted as RoleState), role: 'client' }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<RoleState>),
        role: 'client',
      }),
    },
  ),
)
