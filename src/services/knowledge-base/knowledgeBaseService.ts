import dgaControlsRaw from '@/data/dga_controls.json'
import type {
  ControlRecord,
  DomainSummary,
  KnowledgeBaseFile,
} from '@/types/knowledge-base'
import type { FrameworkId } from '@/types/common'
import { STORAGE_KEYS } from '@/services/storage/storageKeys'

/**
 * Framework-agnostic knowledge base service.
 *
 * Every supported framework provides a JSON file shaped like `KnowledgeBaseFile`.
 * Adding a new framework (PDPL, NCA ECC, ISO 27001, COBIT) only requires
 * registering its JSON file below — no changes to the analysis engine or UI.
 */

function loadOverride(frameworkId: FrameworkId): KnowledgeBaseFile | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.knowledgeBaseOverride(frameworkId))
    return raw ? (JSON.parse(raw) as KnowledgeBaseFile) : undefined
  } catch {
    return undefined
  }
}

const registry: Partial<Record<FrameworkId, KnowledgeBaseFile>> = {
  DGA: loadOverride('DGA') ?? (dgaControlsRaw as KnowledgeBaseFile),
}

function normalizeControls(kb: KnowledgeBaseFile): ControlRecord[] {
  const objectiveByDomain = new Map<string, string>()
  for (const level of kb.levels) {
    for (const sub of level.subdomains) {
      objectiveByDomain.set(sub.id, sub.objective)
    }
  }

  return kb.flat_controls.map((c) => {
    const isSubControl = Boolean(c.parent_id)
    const subControlIds = isSubControl
      ? []
      : kb.flat_controls
          .filter((sc) => sc.parent_id === c.control_id)
          .map((sc) => sc.control_id)

    return {
      controlId: c.control_id,
      text: c.text,
      levelId: c.level_id,
      levelTitle: c.level_title,
      domainId: c.domain_id,
      domainTitle: c.domain_title,
      domainObjective: objectiveByDomain.get(c.domain_id),
      sourcePage: c.source_page,
      parentId: c.parent_id,
      isSubControl,
      subControlIds,
    }
  })
}

class KnowledgeBaseService {
  private cache = new Map<FrameworkId, ControlRecord[]>()

  getFrameworkFile(frameworkId: FrameworkId): KnowledgeBaseFile | undefined {
    return registry[frameworkId]
  }

  isFrameworkAvailable(frameworkId: FrameworkId): boolean {
    return Boolean(registry[frameworkId])
  }

  getControls(frameworkId: FrameworkId): ControlRecord[] {
    if (!this.cache.has(frameworkId)) {
      const kb = registry[frameworkId]
      if (!kb) return []
      this.cache.set(frameworkId, normalizeControls(kb))
    }
    return this.cache.get(frameworkId) ?? []
  }

  /** Only main (non-sub) controls, the primary unit of assessment. */
  getMainControls(frameworkId: FrameworkId): ControlRecord[] {
    return this.getControls(frameworkId).filter((c) => !c.isSubControl)
  }

  getControlById(frameworkId: FrameworkId, controlId: string): ControlRecord | undefined {
    return this.getControls(frameworkId).find((c) => c.controlId === controlId)
  }

  getSubControls(frameworkId: FrameworkId, parentControlId: string): ControlRecord[] {
    return this.getControls(frameworkId).filter((c) => c.parentId === parentControlId)
  }

  getDomainSummaries(frameworkId: FrameworkId): DomainSummary[] {
    const kb = registry[frameworkId]
    if (!kb) return []
    const summaries: DomainSummary[] = []
    for (const level of kb.levels) {
      for (const sub of level.subdomains) {
        summaries.push({
          domainId: sub.id,
          domainTitle: sub.title,
          levelId: level.id,
          levelTitle: level.title,
          objective: sub.objective,
          controlCount: sub.controls.length,
        })
      }
    }
    return summaries
  }

  getMeta(frameworkId: FrameworkId) {
    return registry[frameworkId]?.meta
  }

  getFrameworkMeta(frameworkId: FrameworkId) {
    return registry[frameworkId]?.framework
  }

  /** Replaces the in-memory knowledge base for a framework (used by "اعتماد التحديث"). */
  replaceKnowledgeBase(frameworkId: FrameworkId, file: KnowledgeBaseFile) {
    registry[frameworkId] = file
    this.cache.delete(frameworkId)
    try {
      localStorage.setItem(STORAGE_KEYS.knowledgeBaseOverride(frameworkId), JSON.stringify(file))
    } catch {
      // localStorage unavailable — override stays in-memory only for this session
    }
  }
}

export const knowledgeBaseService = new KnowledgeBaseService()
