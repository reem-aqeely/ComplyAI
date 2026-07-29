import type { DomainCard, FrameworkCard } from '@/types/common'

/** Framework catalogue. Only DGA ships with a knowledge base today; the rest are
 * registered so the selection UI can show them as "coming soon" without any
 * change to the analysis engine once their JSON files are added. */
export const FRAMEWORKS: FrameworkCard[] = [
  {
    id: 'DGA',
    nameAr: 'هيئة الحكومة الرقمية',
    authorityAr: 'DGA — ضوابط حوكمة تقنية المعلومات',
    enabled: true,
    icon: 'landmark',
  },
  {
    id: 'PDPL',
    nameAr: 'الهيئة السعودية للبيانات والذكاء الاصطناعي',
    authorityAr: 'PDPL — حماية البيانات الشخصية',
    enabled: false,
    icon: 'shield-check',
  },
  {
    id: 'NCA_ECC',
    nameAr: 'الهيئة الوطنية للأمن السيبراني',
    authorityAr: 'NCA ECC — الضوابط الأساسية للأمن السيبراني',
    enabled: false,
    icon: 'shield-alert',
  },
  {
    id: 'ISO_27001',
    nameAr: 'ISO 27001',
    authorityAr: 'أيزو — أنظمة إدارة أمن المعلومات',
    enabled: false,
    icon: 'badge-check',
  },
  {
    id: 'COBIT',
    nameAr: 'COBIT',
    authorityAr: 'إطار حوكمة تقنية المعلومات المؤسسية',
    enabled: false,
    icon: 'network',
  },
  {
    id: 'KAQA',
    nameAr: 'جائزة الملك عبدالعزيز للجودة',
    authorityAr: 'التقييم الذاتي وفق معايير الجائزة',
    enabled: false,
    icon: 'trophy',
  },
]

/** Domains within the DGA framework. Only IT governance ships in this POC. */
export const DGA_DOMAINS: DomainCard[] = [
  { id: 'it-governance', titleAr: 'حوكمة تقنية المعلومات', enabled: true },
  { id: 'digital-services', titleAr: 'الخدمات الرقمية', enabled: false },
  { id: 'digital-platforms', titleAr: 'المنصات الرقمية', enabled: false },
  { id: 'risk-continuity', titleAr: 'إدارة المخاطر واستمرارية الأعمال', enabled: false },
  { id: 'digital-content', titleAr: 'المحتوى الرقمي', enabled: false },
  { id: 'enterprise-architecture', titleAr: 'هندسة المؤسسة', enabled: false },
]
