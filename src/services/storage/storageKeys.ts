export const STORAGE_KEYS = {
  role: 'complyai.role.v1',
  assessments: 'complyai.assessments.v1',
  regulationUpdate: 'complyai.regulation-update.v1',
  knowledgeBaseOverride: (frameworkId: string) => `complyai.kb-override.${frameworkId}.v1`,
} as const

const LEGACY_STORAGE_KEYS = {
  role: 'comlyai.role.v1',
  assessments: 'comlyai.assessments.v1',
  regulationUpdate: 'comlyai.regulation-update.v1',
  knowledgeBaseOverride: (frameworkId: string) => `comlyai.kb-override.${frameworkId}.v1`,
} as const

/** One-time migration from the old "comlyai" storage prefix to "complyai".
 * Copies any legacy entry over only if the new key doesn't exist yet, so no
 * existing user data (assessments, role, regulation state) is lost when the
 * platform is renamed. Safe to call on every app start. */
export function migrateLegacyStorageKeys(): void {
  try {
    const pairs: [string, string][] = [
      [LEGACY_STORAGE_KEYS.role, STORAGE_KEYS.role],
      [LEGACY_STORAGE_KEYS.assessments, STORAGE_KEYS.assessments],
      [LEGACY_STORAGE_KEYS.regulationUpdate, STORAGE_KEYS.regulationUpdate],
      [LEGACY_STORAGE_KEYS.knowledgeBaseOverride('DGA'), STORAGE_KEYS.knowledgeBaseOverride('DGA')],
    ]
    for (const [legacyKey, newKey] of pairs) {
      if (localStorage.getItem(newKey) === null) {
        const legacyValue = localStorage.getItem(legacyKey)
        if (legacyValue !== null) localStorage.setItem(newKey, legacyValue)
      }
    }
  } catch {
    // localStorage unavailable — nothing to migrate
  }
}

// Run immediately: every store/service that reads STORAGE_KEYS imports this
// module first, so this always executes before any localStorage read below it.
migrateLegacyStorageKeys()
