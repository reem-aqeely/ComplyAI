export type Role = 'client' | 'consultant'

export type ComplianceStatus = 'compliant' | 'partially_compliant' | 'non_compliant'

export type Priority = 'critical' | 'high' | 'medium' | 'low'

export type FrameworkId = 'DGA' | 'PDPL' | 'NCA_ECC' | 'ISO_27001' | 'COBIT' | 'KAQA'

export interface FrameworkCard {
  id: FrameworkId
  nameAr: string
  authorityAr: string
  enabled: boolean
  icon: string
}

export interface DomainCard {
  id: string
  titleAr: string
  enabled: boolean
}
