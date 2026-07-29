/** Raw shape of a framework knowledge-base JSON file (e.g. dga_controls.json). */

export interface FrameworkMeta {
  id: string
  code: string
  name_ar: string
  name_en: string
  authority_ar: string
  authority_en: string
  version: string
  issued: string
  language: string
  classification_ar: string
  source_file: string
}

export interface ExtractionMeta {
  total_controls: number
  total_domains: number
  total_levels: number
  extraction: string
  main_controls: number
  sub_controls: number
}

export interface RawSubControl {
  control_id: string
  text: string
  level_id: string
  level_title: string
  domain_id: string
  domain_title: string
  source_page: number
  parent_id: string
}

export interface RawControl {
  control_id: string
  text: string
  level_id: string
  level_title: string
  domain_id: string
  domain_title: string
  source_page: number
  sub_controls?: RawSubControl[]
}

export interface RawSubdomain {
  id: string
  title: string
  objective: string
  controls: RawControl[]
}

export interface RawLevel {
  id: string
  title: string
  subdomains: RawSubdomain[]
}

export interface RawFlatControl {
  control_id: string
  text: string
  level_id: string
  level_title: string
  domain_id: string
  domain_title: string
  source_page: number
  parent_id?: string
}

export interface KnowledgeBaseFile {
  framework: FrameworkMeta
  meta: ExtractionMeta
  levels: RawLevel[]
  flat_controls: RawFlatControl[]
}

/** Normalized, UI-friendly control record used throughout the app. */
export interface ControlRecord {
  controlId: string
  text: string
  levelId: string
  levelTitle: string
  domainId: string
  domainTitle: string
  domainObjective?: string
  sourcePage: number
  parentId?: string
  isSubControl: boolean
  subControlIds: string[]
}

export interface DomainSummary {
  domainId: string
  domainTitle: string
  levelId: string
  levelTitle: string
  objective: string
  controlCount: number
}
