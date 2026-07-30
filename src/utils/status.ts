import type { AssessmentStatus, ConsultantAction } from '@/types/assessment'
import type { ComplianceStatus, Priority } from '@/types/common'
import type { BadgeProps } from '@/components/ui/badge'

export const COMPLIANCE_STATUS_LABEL: Record<ComplianceStatus, string> = {
  compliant: 'ممتثل',
  partially_compliant: 'ممتثل جزئياً',
  non_compliant: 'غير ممتثل',
}

export const COMPLIANCE_STATUS_BADGE: Record<ComplianceStatus, NonNullable<BadgeProps['variant']>> = {
  compliant: 'success',
  partially_compliant: 'warning',
  non_compliant: 'danger',
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  critical: 'حرجة',
  high: 'مرتفعة',
  medium: 'متوسطة',
  low: 'منخفضة',
}

export const PRIORITY_BADGE: Record<Priority, NonNullable<BadgeProps['variant']>> = {
  critical: 'critical',
  high: 'danger',
  medium: 'warning',
  low: 'outline',
}

export const ASSESSMENT_STATUS_LABEL: Record<AssessmentStatus, string> = {
  draft: 'مسودة',
  analyzing: 'جاري التحليل',
  analyzed: 'تم التحليل',
  submitted_to_consultant: 'بانتظار مراجعة المستشار',
  under_review: 'قيد المراجعة',
  needs_info: 'بانتظار معلومات إضافية',
  approved: 'معتمد',
  rejected: 'مرفوض',
  escalated: 'مُصعّد',
  finalized: 'التقرير النهائي صادر',
}

export const ASSESSMENT_STATUS_BADGE: Record<AssessmentStatus, NonNullable<BadgeProps['variant']>> = {
  draft: 'outline',
  analyzing: 'info',
  analyzed: 'info',
  submitted_to_consultant: 'warning',
  under_review: 'info',
  needs_info: 'warning',
  approved: 'success',
  rejected: 'danger',
  escalated: 'critical',
  finalized: 'gold',
}

/** Statuses in which a consultant may still act on an assessment and its
 * individual controls. `escalated` and `rejected` are included deliberately:
 * neither the client nor the consultant has any other way to move an escalated
 * assessment forward, so leaving them out strands it permanently. */
const CONSULTANT_REVIEWABLE_STATUSES: AssessmentStatus[] = [
  // `analyzed` is included because it is where an assessment lands as soon as
  // the analysis finishes, and there is no longer a hand-off step after it —
  // so review has to be possible from that state or the action bar would never
  // appear at all.
  'analyzed',
  'submitted_to_consultant',
  'under_review',
  'needs_info',
  'escalated',
  'rejected',
]

export function isConsultantReviewable(status: AssessmentStatus): boolean {
  return CONSULTANT_REVIEWABLE_STATUSES.includes(status)
}

export const CONSULTANT_ACTION_LABEL: Record<ConsultantAction, string> = {
  approve: 'اعتماد',
  modify: 'تعديل',
  reject: 'رفض',
  request_info: 'طلب معلومات إضافية',
  escalate: 'تصعيد الحالة',
}
