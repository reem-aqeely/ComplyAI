import { knowledgeBaseService } from '@/services/knowledge-base/knowledgeBaseService'
import type { AnalysisResult, ControlFinding } from '@/types/assessment'
import type { ComplianceStatus, FrameworkId, Priority } from '@/types/common'

/**
 * ============================================================================
 * DEMO SIMULATION DATA — "محاكاة التجربة"
 * ============================================================================
 * Drives the demo-only simulation button on the upload step. Nothing here ever
 * reaches Gemini: the analysis is assembled locally and written straight to the
 * store, so the whole assessment experience can be shown without uploading a
 * document or spending an API call.
 *
 * Control ids below are real entries from `dga_controls.json`; the control text,
 * level, domain and source page are resolved from the knowledge base at runtime
 * so the simulated findings always line up with the actual DGA framework.
 *
 * This is entirely separate from the real pipeline in
 * `services/gemini/analysisEngine.ts` and from the seeded sample assessments in
 * `mockAssessment.ts`.
 * ============================================================================
 */

/** Written into `AnalysisResult.modelVersion` so a simulated assessment is
 * always identifiable in stored data, reports and the audit trail. */
export const SIMULATION_MODEL_VERSION = 'simulation-demo'

/** Referenced by the simulated evidence. No real file is ever uploaded. */
const SIMULATED_FILE_NAME = 'سياسة-حوكمة-تقنية-المعلومات-(محاكاة).pdf'

interface SeedFinding {
  controlId: string
  status: ComplianceStatus
  priority: Priority
  confidence: number
  page: number
  evidence: string
  reasoning: string
  recommendation: string
}

/** 16 controls spanning all five DGA levels and 16 distinct domains, so the
 * distribution and per-domain charts both look like a real assessment.
 * 14 compliant + 2 partially compliant => (14 + 2×0.5) / 16 = 93.75% ≈ 94%. */
const SEED_FINDINGS: SeedFinding[] = [
  {
    controlId: '5-108-04',
    status: 'compliant',
    priority: 'low',
    confidence: 97,
    page: 6,
    evidence: 'تُراجع الميزانية الرئيسة لتقنية المعلومات ربع سنوياً في اجتماع اللجنة التوجيهية، وتُعتمد التعديلات بقرار موثق.',
    reasoning: 'وثّقت السياسة دورية المراجعة وجهة الاعتماد ومحاضر الاجتماعات، وهو ما يستوفي متطلب المراجعة الدورية للميزانية بالكامل.',
    recommendation: 'الاستمرار في ربط بنود الميزانية بمبادرات خارطة الطريق لتسهيل تتبع الأثر المالي.',
  },
  {
    controlId: '5-108-08',
    status: 'compliant',
    priority: 'low',
    confidence: 96,
    page: 8,
    evidence: 'تُحدَّث سياسات وإجراءات تقنية المعلومات سنوياً، وآخر تحديث معتمد بتاريخ 1447/01/12هـ مع سجل إصدارات كامل.',
    reasoning: 'يثبت سجل الإصدارات التزام الجهة بدورة تحديث سنوية معتمدة، مع توثيق الجهة المعتمدة لكل إصدار.',
    recommendation: 'إضافة مؤشر لقياس نسبة اطلاع المنسوبين على السياسات المحدثة بعد كل إصدار.',
  },
  {
    controlId: '5-108-09',
    status: 'compliant',
    priority: 'low',
    confidence: 98,
    page: 11,
    evidence: 'اعتُمدت مصفوفة أدوار ومسؤوليات (RACI) تغطي جميع عمليات الوحدة الإدارية لتقنية المعلومات، وتُراجع سنوياً.',
    reasoning: 'المصفوفة المرفقة تحدد الأدوار والمسؤوليات لكل عملية بشكل صريح، وتغطي الحد الأدنى المطلوب في الضابط.',
    recommendation: 'مواءمة المصفوفة مع أي تغييرات في الهيكل التنظيمي فور صدورها.',
  },
  {
    controlId: '5-108-10',
    status: 'partially_compliant',
    priority: 'high',
    confidence: 71,
    page: 14,
    evidence: 'توجد سياسة معتمدة لإدارة مخاطر تقنية المعلومات وسجل مخاطر محدَّث ربع سنوياً، دون توثيق واضح لآلية متابعة خطط المعالجة حتى الإغلاق.',
    reasoning: 'الاعتماد والتعميم مستوفيان، إلا أن التنفيذ ناقص في جانب متابعة خطط المعالجة، وهو أحد متطلبات الضابط.',
    recommendation: 'توثيق آلية متابعة خطط معالجة المخاطر مع تحديد مالك وتاريخ مستهدف لكل خطة، وربطها بسجل المخاطر المؤسسي.',
  },
  {
    controlId: '5-108-21',
    status: 'compliant',
    priority: 'medium',
    confidence: 92,
    page: 16,
    evidence: 'اعتُمدت خطة تعاقب وظيفي للأدوار الحساسة في تقنية المعلومات، تتضمن تحديد البدائل وخطط التأهيل المرتبطة بها.',
    reasoning: 'الإجراءات الموثقة تغطي تحديد الأدوار الحساسة والبدائل وآلية التأهيل، بما يحقق متطلب فاعلية التعاقب الوظيفي.',
    recommendation: 'اختبار خطة التعاقب عملياً مرة سنوياً على الأقل للتحقق من جاهزية البدائل.',
  },
  {
    controlId: '5-108-25',
    status: 'compliant',
    priority: 'low',
    confidence: 95,
    page: 18,
    evidence: 'تتضمن الخطة الاستراتيجية (2025–2027) خارطة طريق لمبادرات تقنية المعلومات بجدول زمني وميزانية تقديرية ومؤشرات قياس لكل مبادرة.',
    reasoning: 'خارطة الطريق المرفقة تغطي العناصر المطلوبة في الضابط بشكل صريح ومترابط مع الأهداف الاستراتيجية للجهة.',
    recommendation: 'مراجعة خارطة الطريق نصف سنوياً لضمان مواكبتها للأولويات المتغيرة.',
  },
  {
    controlId: '5-108-29',
    status: 'compliant',
    priority: 'low',
    confidence: 93,
    page: 21,
    evidence: 'تُراجع إستراتيجية البنية التقنية سنوياً، وتُعتمد المخرجات من اللجنة التوجيهية مع توثيق التغييرات الجوهرية.',
    reasoning: 'دورية المراجعة السنوية وجهة الاعتماد موثقتان، وهو ما يطلبه الضابط.',
    recommendation: 'توثيق أثر كل مراجعة على خطة الاستبدال التقني للأصول القائمة.',
  },
  {
    controlId: '5-108-34',
    status: 'compliant',
    priority: 'medium',
    confidence: 94,
    page: 24,
    evidence: 'تُوقَّع اتفاقيات عدم إفصاح مع جميع مزودي الخدمة الخارجيين قبل منح الوصول، وتُحفظ نسخ موقعة في ملف العقد.',
    reasoning: 'الإجراء موثق وملزم لجميع المزودين، ويحقق متطلب المحافظة على سرية البيانات والمعلومات.',
    recommendation: 'إضافة مراجعة دورية للتحقق من سارية الاتفاقيات مع تجديد العقود.',
  },
  {
    controlId: '5-108-44',
    status: 'compliant',
    priority: 'low',
    confidence: 90,
    page: 27,
    evidence: 'تُقاس فاعلية إجراءات اقتناء النظم والخدمات الرقمية عبر مؤشرات زمن الاقتناء ونسبة الالتزام بالمواصفات، وتُرفع نصف سنوياً.',
    reasoning: 'وجود مؤشرات معتمدة وتقارير دورية يحقق متطلب قياس الفاعلية الواردة في الضابط.',
    recommendation: 'إضافة مؤشر لرضا الجهات المستفيدة عن النظم المقتناة.',
  },
  {
    controlId: '5-108-47',
    status: 'compliant',
    priority: 'low',
    confidence: 91,
    page: 29,
    evidence: 'تُراجع إجراءات إدارة التهيئة سنوياً، وتُوثَّق نتائج التقييم والتحسينات المعتمدة عليها.',
    reasoning: 'المراجعة السنوية الموثقة تغطي متطلب الضابط في المراجعة والتقييم الدوري.',
    recommendation: 'ربط قاعدة بيانات التهيئة بسجل الأصول لتفادي الاختلاف بين السجلين.',
  },
  {
    controlId: '5-108-53',
    status: 'compliant',
    priority: 'medium',
    confidence: 96,
    page: 31,
    evidence: 'تُنفَّذ وتُوثَّق اختبارات الوحدة والتكامل واختبار قبول المستخدم لكل تغيير، وتُعتمد النتائج من لجنة ضبط التغيير قبل النقل للإنتاج.',
    reasoning: 'أنواع الاختبارات المطلوبة في الضابط موجودة وموثقة ضمن دورة إدارة التغيير المعتمدة.',
    recommendation: 'توثيق خطة تراجع (Rollback) لكل تغيير عالي الأثر ضمن ملف طلب التغيير.',
  },
  {
    controlId: '5-108-75',
    status: 'partially_compliant',
    priority: 'medium',
    confidence: 68,
    page: 34,
    evidence: 'يوجد سجل أصول رقمية وتقنية يتضمن المالك والتصنيف، ويُجرد سنوياً، دون مؤشرات معتمدة لقياس فاعلية عملية إدارة الأصول.',
    reasoning: 'السجل والجرد يغطيان جانب التنفيذ، لكن الضابط يطلب مراقبة الفاعلية وقياسها وتقييمها دورياً وهو الجزء غير المستوفى.',
    recommendation: 'اعتماد مؤشرات لقياس فاعلية إدارة الأصول (دقة السجل، نسبة الأصول غير المصنفة) ورفعها ضمن تقارير اللجنة الربع سنوية.',
  },
  {
    controlId: '5-108-82',
    status: 'compliant',
    priority: 'medium',
    confidence: 94,
    page: 37,
    evidence: 'اعتُمدت مؤشرات أداء للخدمات الرقمية تشمل التوافر وزمن الاستجابة ونسبة الإنجاز، وتُراقب شهرياً عبر لوحة مؤشرات.',
    reasoning: 'المؤشرات المعتمدة وآلية المراقبة الشهرية تغطيان متطلب إعداد ومراقبة مؤشرات أداء الخدمات والنظم.',
    recommendation: 'إضافة حدود تحذيرية آلية للمؤشرات لتسريع الاستجابة قبل تجاوز مستويات الخدمة.',
  },
  {
    controlId: '5-108-90',
    status: 'compliant',
    priority: 'high',
    confidence: 97,
    page: 39,
    evidence: 'تُجرى نسخ احتياطية يومية، وتُختبر عمليات الاستعادة نصف سنوياً مع توثيق نتائج الاختبار وزمن التعافي الفعلي.',
    reasoning: 'قياس الفاعلية عبر اختبارات الاستعادة الموثقة يحقق متطلب الضابط في التقييم الدوري لإجراءات النسخ والاستعادة.',
    recommendation: 'توسيع نطاق اختبار الاستعادة ليشمل سيناريو فقدان مركز البيانات الرئيس بالكامل.',
  },
  {
    controlId: '5-108-108',
    status: 'compliant',
    priority: 'medium',
    confidence: 95,
    page: 42,
    evidence: 'تُرفع تقارير أداء دورية للإدارة العليا ربع سنوياً، وتتضمن مقارنة الأداء الفعلي بالمستهدف والإجراءات التصحيحية.',
    reasoning: 'وجود تقارير دورية معتمدة موجهة للإدارة العليا يستوفي متطلب متابعة مستوى الأداء الوارد في الضابط.',
    recommendation: 'إدراج تحليل الاتجاهات على مدى أربعة أرباع في التقرير لإبراز التحسن التراكمي.',
  },
  {
    controlId: '5-108-116',
    status: 'compliant',
    priority: 'medium',
    confidence: 92,
    page: 45,
    evidence: 'اعتُمدت إجراءات لمتابعة خطط العلاج الناتجة عن التدقيق الداخلي، مع سجل يتتبع كل ملاحظة حتى الإغلاق.',
    reasoning: 'الإجراءات وسجل المتابعة يمكّنان الجهة من تتبع ومراقبة خطط العلاج، وهو ما يطلبه الضابط.',
    recommendation: 'تحديد مدة قصوى لإغلاق الملاحظات عالية الخطورة وربطها بتقارير الالتزام.',
  },
]

const EXECUTIVE_SUMMARY =
  'يعرض هذا التقييم التجريبي نتائج محاكاة كاملة لمقارنة وثائق حوكمة تقنية المعلومات بضوابط هيئة الحكومة الرقمية (DGA). بلغت نسبة الامتثال المحاكاة مستوى مرتفعاً يعكس نضجاً مؤسسياً واضحاً في الحوكمة والتخطيط وإدارة التغيير واستمرارية الأعمال، مع التزام موثق بدورات المراجعة والاعتماد الدورية. تتركز الفجوات المتبقية في جانبين تشغيليين محددين هما متابعة خطط معالجة المخاطر حتى الإغلاق، وقياس فاعلية إدارة الأصول الرقمية والتقنية. هذه النتائج بيانات تجريبية لأغراض العرض فقط، ولا تمثل تقييماً فعلياً لأي جهة.'

const GAP_ANALYSIS =
  'أظهرت المحاكاة أن الأساس المؤسسي للحوكمة مكتمل: لجنة توجيهية فاعلة، ومصفوفة أدوار معتمدة، وخارطة طريق استراتيجية مرتبطة بمؤشرات قياس، ودورة إدارة تغيير موثقة باختبارات متعددة المستويات. الفجوتان المتبقيتان جزئيتان وليستا هيكليتين: الأولى غياب توثيق صريح لآلية متابعة خطط معالجة المخاطر حتى الإغلاق، والثانية عدم اعتماد مؤشرات لقياس فاعلية عملية إدارة الأصول الرقمية والتقنية رغم وجود السجل والجرد السنوي. معالجة هاتين الفجوتين خلال ربعين كافية لرفع مستوى الامتثال إلى النطاق المستهدف بالكامل.'

const STRENGTHS = [
  'لجنة توجيهية لحوكمة تقنية المعلومات فاعلة، بمحاضر وقرارات موثقة ومراجعة ربع سنوية للميزانية',
  'دورة إدارة تغيير مكتملة تشمل اختبارات الوحدة والتكامل وقبول المستخدم قبل النقل إلى الإنتاج',
  'نسخ احتياطية يومية مع اختبار استعادة نصف سنوي موثق وقياس فعلي لزمن التعافي',
  'مؤشرات أداء معتمدة للخدمات الرقمية تُراقب شهرياً وتُرفع للإدارة العليا ربع سنوياً',
]

const RECOMMENDATIONS: AnalysisResult['recommendations'] = [
  {
    id: 'sim_rec_risk_followup',
    priority: 'high',
    title: 'استكمال آلية متابعة خطط معالجة المخاطر',
    why: 'سياسة إدارة المخاطر معتمدة ومعمَّمة، إلا أن غياب توثيق متابعة خطط المعالجة يُبقي الضابط مستوفى جزئياً ويُضعف القدرة على إثبات الالتزام أمام المدقق.',
    expectedImpact: 'إغلاق الفجوة الجزئية في ضابط إدارة المخاطر ورفع نسبة الامتثال الإجمالية، مع تحسين جاهزية الجهة للتدقيق الخارجي.',
    recommendedAction: 'توثيق إجراء لمتابعة خطط المعالجة يحدد مالك كل خطة وتاريخها المستهدف وحالتها، وربطه بسجل المخاطر المؤسسي ورفعه ربع سنوياً للجنة التوجيهية.',
    relatedControlIds: ['5-108-10'],
  },
  {
    id: 'sim_rec_asset_kpis',
    priority: 'medium',
    title: 'اعتماد مؤشرات لقياس فاعلية إدارة الأصول',
    why: 'سجل الأصول والجرد السنوي قائمان، لكن الضابط يطلب مراقبة فاعلية العملية وقياسها وتقييمها دورياً وهو الجزء غير المستوفى.',
    expectedImpact: 'اكتمال متطلبات إدارة الأصول الرقمية والتقنية، وتحسين دقة السجل وموثوقية بيانات دورة حياة الأصول.',
    recommendedAction: 'اعتماد مؤشرات لدقة السجل ونسبة الأصول غير المصنفة وزمن تحديث السجل بعد كل تغيير، وإدراجها في تقارير الأداء الربع سنوية.',
    relatedControlIds: ['5-108-75'],
  },
  {
    id: 'sim_rec_dr_scope',
    priority: 'medium',
    title: 'توسيع نطاق اختبار التعافي من الكوارث',
    why: 'اختبارات الاستعادة الحالية موثقة وفاعلة، لكنها لا تغطي سيناريو فقدان مركز البيانات الرئيس بالكامل.',
    expectedImpact: 'رفع مستوى الثقة في خطة استمرارية الأعمال والتحقق العملي من زمن الاستهداف للتعافي (RTO) المعلن.',
    recommendedAction: 'تنفيذ تمرين تعافٍ شامل مرة سنوياً يحاكي فقدان المركز الرئيس، وتوثيق النتائج والدروس المستفادة.',
    relatedControlIds: ['5-108-90'],
  },
]

const ACTION_PLAN: AnalysisResult['actionPlan'] = [
  {
    id: 'sim_act_risk_followup',
    priority: 'high',
    task: 'توثيق واعتماد إجراء متابعة خطط معالجة مخاطر تقنية المعلومات حتى الإغلاق',
    owner: 'إدارة المخاطر بالتنسيق مع إدارة تقنية المعلومات',
    suggestedDuration: '60 يوماً',
    relatedControlIds: ['5-108-10'],
  },
  {
    id: 'sim_act_asset_kpis',
    priority: 'medium',
    task: 'اعتماد مؤشرات قياس فاعلية إدارة الأصول وإدراجها في تقارير الأداء الدورية',
    owner: 'إدارة تقنية المعلومات',
    suggestedDuration: '90 يوماً',
    relatedControlIds: ['5-108-75'],
  },
  {
    id: 'sim_act_dr_exercise',
    priority: 'medium',
    task: 'تنفيذ تمرين تعافٍ شامل يحاكي فقدان مركز البيانات الرئيس وتوثيق نتائجه',
    owner: 'إدارة العمليات والبنية التقنية',
    suggestedDuration: '120 يوماً',
    relatedControlIds: ['5-108-90'],
  },
  {
    id: 'sim_act_policy_awareness',
    priority: 'low',
    task: 'إطلاق مؤشر لقياس اطلاع المنسوبين على السياسات المحدثة بعد كل إصدار',
    owner: 'إدارة تقنية المعلومات بالتنسيق مع الموارد البشرية',
    suggestedDuration: '90 يوماً',
    relatedControlIds: ['5-108-08'],
  },
]

function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.min(100, Math.max(0, Math.round(value)))
}

/**
 * Assembles the simulated analysis. Purely local — no network call. Control
 * metadata is read from the knowledge base so the findings reference genuine
 * DGA controls; any seed whose control id is missing is skipped rather than
 * fabricating a control that does not exist in the framework.
 */
export function buildSimulatedAnalysis(frameworkId: FrameworkId): AnalysisResult {
  const controlFindings: ControlFinding[] = SEED_FINDINGS.flatMap((seed) => {
    const control = knowledgeBaseService.getControlById(frameworkId, seed.controlId)
    if (!control) return []
    return [
      {
        controlId: control.controlId,
        controlText: control.text,
        levelId: control.levelId,
        levelTitle: control.levelTitle,
        domainId: control.domainId,
        domainTitle: control.domainTitle,
        sourcePage: control.sourcePage,
        status: seed.status,
        priority: seed.priority,
        evidence: seed.evidence,
        evidenceRefs: [{ fileName: SIMULATED_FILE_NAME, page: seed.page, quote: seed.evidence }],
        reasoning: seed.reasoning,
        confidence: seed.confidence,
        recommendation: seed.recommendation,
      },
    ]
  })

  const satisfiedCount = controlFindings.filter((f) => f.status === 'compliant').length
  const partiallySatisfiedCount = controlFindings.filter((f) => f.status === 'partially_compliant').length
  const unsatisfiedCount = controlFindings.filter((f) => f.status === 'non_compliant').length
  const criticalCount = controlFindings.filter((f) => f.priority === 'critical').length

  // Same weighting the real engine uses, so the headline score always agrees
  // with the findings shown in the table and the charts.
  const complianceScore =
    controlFindings.length > 0
      ? clampScore(((satisfiedCount + partiallySatisfiedCount * 0.5) / controlFindings.length) * 100)
      : 0

  return {
    generatedAt: new Date().toISOString(),
    modelVersion: SIMULATION_MODEL_VERSION,
    complianceScore,
    confidenceScore: 96,
    satisfiedCount,
    partiallySatisfiedCount,
    unsatisfiedCount,
    criticalCount,
    executiveSummary: EXECUTIVE_SUMMARY,
    strengths: [...STRENGTHS],
    gapAnalysis: GAP_ANALYSIS,
    controlFindings,
    recommendations: RECOMMENDATIONS.map((r) => ({ ...r })),
    actionPlan: ACTION_PLAN.map((a) => ({ ...a })),
  }
}
