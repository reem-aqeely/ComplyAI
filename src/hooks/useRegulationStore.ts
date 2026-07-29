import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RegulationUpdateCheck } from '@/types/regulation'
import { STORAGE_KEYS } from '@/services/storage/storageKeys'

interface RegulationState {
  lastCheck: RegulationUpdateCheck | null
  appliedVersion: string
  setLastCheck: (check: RegulationUpdateCheck) => void
  applyUpdate: (newVersion: string) => void
  dismissUpdate: () => void
}

export const useRegulationStore = create<RegulationState>()(
  persist(
    (set) => ({
      lastCheck: null,
      appliedVersion: '3.0',
      setLastCheck: (check) => set({ lastCheck: check }),
      applyUpdate: (newVersion) =>
        set((state) => ({
          appliedVersion: newVersion,
          lastCheck: state.lastCheck ? { ...state.lastCheck, hasUpdate: false } : state.lastCheck,
        })),
      dismissUpdate: () =>
        set((state) => ({ lastCheck: state.lastCheck ? { ...state.lastCheck, hasUpdate: false } : state.lastCheck })),
    }),
    { name: STORAGE_KEYS.regulationUpdate },
  ),
)
