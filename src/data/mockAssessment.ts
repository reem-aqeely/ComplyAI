import type { Assessment, ActionPlanItem, AnalysisResult, AuditEntry, ControlFinding, Recommendation, UploadedFileRecord } from '@/types/assessment'

/**
 * ============================================================================
 * DEMO / MOCK MODE — single switch
 * ============================================================================
 * Set to `false` to always use the real Gemini analysis pipeline.
 * Set to `true` to skip the AI call entirely and drive the app from the
 * editable sample data below (see `src/services/gemini/analysisEngine.ts`).
 *
 * Everything under this flag is plain data — edit any field below and the
 * dashboard, controls table, recommendations, action plan and final report
 * all update automatically, since they read `assessment.analysis` reactively
 * from the same store the real AI flow writes to.
 * ============================================================================
 */
export const MOCK_MODE_ENABLED = false

const MOCK_ORGANIZATION_NAME = 'شركة التقنية الوطنية'
const MOCK_CLIENT_NAME = 'م. فيصل الحربي'
export const MOCK_ASSESSMENT_ID = 'assess_mock_demo_national_tech'
const MOCK_FILE_NAME = 'سياسة-حوكمة-تقنية-المعلومات-2025.pdf'

const BASE_TIME = new Date('2026-06-01T09:00:00.000Z').getTime()
const HOUR = 3_600_000
const at = (hoursOffset: number) => new Date(BASE_TIME + hoursOffset * HOUR).toISOString()

/** One row per requirement in the "Controls" list — edit freely. Each control_id
 * / domain_title / level_title pair is a real entry from dga_controls.json so
 * the sample lines up with the actual DGA framework. */
const MOCK_CONTROL_FINDINGS: ControlFinding[] = [
  {
    controlId: '5-108-01',
    controlText:
      'تنشئ الإدارة العليا للجهة الحكومية لجنة داخلية توجيهية للإشراف على أعمال حوكمة تقنية المعلومات، وبما لا يتعارض مع قرار مجلس الوزراء رقم (40) وتاريخ 1427/2/27هـ، الصادر بالموافقة على ضوابط تطبيق التعاملات الإلكترونية الحكومية.',
    levelId: '7.1',
    levelTitle: 'إدارة تقنية المعلومات',
    domainId: '7.1.1',
    domainTitle: 'ضوابط إدارة العمليات', // Governance Committee
    sourcePage: 10,
    status: 'compliant',
    priority: 'low',
    evidence:
      'تم تشكيل اللجنة التوجيهية لحوكمة تقنية المعلومات بقرار رسمي صادر عن الإدارة العليا، وتضم ممثلين عن جميع الإدارات ذات العلاقة.',
    evidenceRefs: [{ fileName: MOCK_FILE_NAME, page: 4, quote: 'قرار تشكيل اللجنة التوجيهية لحوكمة تقنية المعلومات رقم 12.' }],
    reasoning: 'الوثيقة المرفقة توثّق قرار التشكيل ومحاضر الاجتماعات الدورية للجنة، وتغطي جميع متطلبات الضابط.',
    confidence: 100,
    recommendation: 'الاستمرار في عقد اجتماعات اللجنة بشكل ربع سنوي وتوثيق محاضرها.',
    consultantDecision: {
      action: 'approve',
      notes: 'تم التحقق من قرار التشكيل ومحاضر الاجتماعات — الضابط مستوفى بالكامل.',
      decidedAt: at(30),
      decidedBy: 'المستشار',
    },
  },
  {
    controlId: '5-108-09',
    controlText:
      'تكليف المسؤول الأول للوحدة الإدارية المسؤولة عن تقنية المعلومات بإعداد مهام الوحدة الإدارية المسؤول عنها، على أن تشمل، بحد أدنى، تحديد الأدوار والمسؤوليات.',
    levelId: '7.1',
    levelTitle: 'إدارة تقنية المعلومات',
    domainId: '7.1.3',
    domainTitle: 'ضوابط تحديد الأدوار والمسؤوليات', // Roles & Responsibilities
    sourcePage: 12,
    status: 'compliant',
    priority: 'low',
    evidence:
      'تتضمن السياسة المعتمدة توصيفاً واضحاً لمهام الوحدة الإدارية المسؤولة عن تقنية المعلومات وأدوار جميع العاملين فيها.',
    evidenceRefs: [{ fileName: MOCK_FILE_NAME, page: 7, quote: 'مصفوفة الأدوار والمسؤوليات المعتمدة لإدارة تقنية المعلومات.' }],
    reasoning: 'تم رصد وثيقة رسمية معتمدة تحدد الأدوار والمسؤوليات بدقة، مع مصفوفة تصعيد واضحة.',
    confidence: 100,
    recommendation: 'مراجعة مصفوفة الأدوار سنوياً لضمان مواكبتها للهيكل التنظيمي المحدث.',
    consultantDecision: {
      action: 'approve',
      notes: 'التوصيف موثق ومعتمد رسمياً، لا حاجة لإجراء إضافي حالياً.',
      decidedAt: at(30),
      decidedBy: 'المستشار',
    },
  },
  {
    controlId: '5-108-10',
    controlText: 'اعتماد، وتعميم، وتنفيذ سياسات وإجراءات إدارة مخاطر تقنية المعلومات داخليًا.',
    levelId: '7.1',
    levelTitle: 'إدارة تقنية المعلومات',
    domainId: '7.1.4',
    domainTitle: 'ضوابط إدارة مخاطر تقنية المعلومات', // Risk Management
    sourcePage: 13,
    status: 'partially_compliant',
    priority: 'high',
    evidence:
      'توجد سياسة عامة لإدارة مخاطر تقنية المعلومات، لكنها لا تغطي جميع خطوات دورة إدارة المخاطر (التحديد، التقييم، المعالجة، والمتابعة الدورية).',
    evidenceRefs: [{ fileName: MOCK_FILE_NAME, page: 11, quote: 'سياسة إدارة مخاطر تقنية المعلومات — الإصدار 1.2.' }],
    reasoning: 'السياسة المرفوعة تتناول تحديد المخاطر ابتدائياً، لكنها تفتقر لآلية موثقة لمتابعة خطط المعالجة وتحديثها دورياً.',
    confidence: 60,
    recommendation: 'استكمال دورة إدارة المخاطر بإضافة آلية متابعة دورية وربطها بسجل المخاطر المؤسسي.',
    consultantDecision: {
      action: 'approve',
      notes: 'أوافق على التصنيف الجزئي، ويُطلب من الجهة استكمال آلية المتابعة الدورية خلال الربع القادم.',
      decidedAt: at(30),
      decidedBy: 'المستشار',
    },
  },
  {
    controlId: '5-108-67',
    controlText:
      'إعداد واعتماد وتعميم وتنفيذ سياسات واجراءات وعمليات إدارة الأصول على أن تتضمن كحد أدنى: الإعداد والتشغيل الأولي، وتعريف الأصول وتصنيفها ووسمها، وآلية حصرها، وآلية الإتلاف والتخلص منها.',
    levelId: '7.3',
    levelTitle: 'بناء وتطوير وتنفيذ أنظمة تقنية المعلومات',
    domainId: '7.3.5',
    domainTitle: 'ضوابط إدارة الأصول الرقمية والتقنية', // Asset Management
    sourcePage: 24,
    status: 'non_compliant',
    priority: 'critical',
    evidence:
      'أشارت الوثيقة إلى وجود سجل أولي غير مكتمل للأصول التقنية، دون تحديد واضح لآلية التصنيف أو دورة حياة الأصول أو إجراءات الإتلاف الآمن.',
    evidenceRefs: [{ fileName: MOCK_FILE_NAME, page: 18, quote: 'قائمة أولية غير مكتملة بأصول تقنية المعلومات.' }],
    reasoning: 'السجل المتاح جزئي ولا يغطي أغلب متطلبات الضابط المتعلقة بالتصنيف والوسم وآلية التخلص من الأصول.',
    confidence: 20,
    recommendation: 'بناء سجل شامل ومحدث لجميع الأصول الرقمية والتقنية، مع اعتماد سياسة إدارة أصول متكاملة تغطي دورة الحياة الكاملة.',
    consultantDecision: {
      action: 'approve',
      notes: 'فجوة جوهرية تستدعي خطة تصحيحية عاجلة؛ تم تصنيفها ضمن الأولويات الحرجة لخطة العمل.',
      decidedAt: at(30),
      decidedBy: 'المستشار',
    },
  },
  {
    controlId: '5-108-110',
    controlText:
      'تطوير خطة للتدقيق على تقنية المعلومات، مع تحديد النطاقات الرئيسة، والتي تشمل (حوكمة تقنية المعلومات، والكوادر البشرية، والعمليات والتقنيات).',
    levelId: '7.5',
    levelTitle: 'مراقبة الأداء والتحسين المستمر',
    domainId: '7.5.2',
    domainTitle: 'ضوابط التدقيق الداخلي على تقنية المعلومات', // Internal Audit
    sourcePage: 33,
    status: 'partially_compliant',
    priority: 'medium',
    evidence:
      'توجد خطة تدقيق داخلي لتقنية المعلومات، إلا أنها لا تغطي نطاق الحوكمة والكوادر البشرية بشكل كامل كما يتطلبه الضابط.',
    evidenceRefs: [{ fileName: MOCK_FILE_NAME, page: 21, quote: 'خطة التدقيق الداخلي السنوية — النطاق التشغيلي فقط.' }],
    reasoning: 'الخطة المتاحة تركز على الجوانب التشغيلية فقط، دون تغطية واضحة لحوكمة تقنية المعلومات أو الكوادر البشرية.',
    confidence: 50,
    recommendation: 'تحديث خطة التدقيق الداخلي لتشمل جميع النطاقات الثلاثة المطلوبة (الحوكمة، الكوادر، العمليات والتقنيات).',
    consultantDecision: {
      action: 'approve',
      notes: 'خطة التدقيق تحتاج توسيعاً ليشمل الحوكمة والكوادر البشرية، أوافق على التصنيف الجزئي.',
      decidedAt: at(30),
      decidedBy: 'المستشار',
    },
  },
  {
    controlId: '5-108-106',
    controlText:
      'تطوير واعتماد وتنفيذ مؤشرات قياس الأداء الرئيسة، لقياس مدى جودة تنفيذ عمليات تقنية المعلومات وأداء المنصات والخدمات الرقمية لدى الجهة.',
    levelId: '7.5',
    levelTitle: 'مراقبة الأداء والتحسين المستمر',
    domainId: '7.5.1',
    domainTitle: 'ضوابط إدارة الأداء', // KPI Monitoring
    sourcePage: 32,
    status: 'non_compliant',
    priority: 'high',
    evidence:
      'أشارت الوثيقة إلى وجود بعض المؤشرات التشغيلية غير الرسمية، دون اعتماد رسمي أو ربط مباشر بجودة تنفيذ عمليات تقنية المعلومات.',
    evidenceRefs: [{ fileName: MOCK_FILE_NAME, page: 27, quote: 'مؤشرات تشغيلية داخلية غير معتمدة رسمياً.' }],
    reasoning: 'لا يوجد اعتماد رسمي لمؤشرات قياس الأداء الرئيسة، ولا آلية موثقة لمتابعتها ورفع التقارير الدورية بشأنها.',
    confidence: 30,
    recommendation: 'تطوير واعتماد مؤشرات أداء رئيسة رسمية، وربطها بتقارير دورية تُرفع للإدارة العليا.',
    consultantDecision: {
      action: 'approve',
      notes: 'غياب الاعتماد الرسمي للمؤشرات يستدعي معالجة سريعة، أوصي بمتابعتها ضمن اجتماع اللجنة القادم.',
      decidedAt: at(30),
      decidedBy: 'المستشار',
    },
  },
  {
    controlId: '5-108-06',
    controlText:
      'اعتماد وتعميم وتنفيذ سياسات وإجراءات تقنية المعلومات داخليًا متضمنة بحد أدنى: الأهداف والنطاق والتطبيق، والمسؤوليات العامة والخاصة، والربط بالضوابط التشريعية والتنظيمية الوطنية ذات العلاقة.',
    levelId: '7.1',
    levelTitle: 'إدارة تقنية المعلومات',
    domainId: '7.1.2',
    domainTitle: 'ضوابط سياسات وإجراءات تقنية المعلومات', // Policy Review
    sourcePage: 11,
    status: 'compliant',
    priority: 'low',
    evidence:
      'تم اعتماد وتعميم سياسات وإجراءات تقنية المعلومات داخلياً، وتغطي الأهداف والنطاق والمسؤوليات العامة والخاصة.',
    evidenceRefs: [{ fileName: MOCK_FILE_NAME, page: 5, quote: 'سياسة تقنية المعلومات الرئيسة — معتمدة ومعممة.' }],
    reasoning:
      'السياسة المعتمدة تغطي معظم عناصر الضابط، مع ملاحظة بسيطة تتعلق بتحديث الربط بالضوابط التنظيمية الوطنية الأحدث.',
    confidence: 90,
    recommendation: 'تحديث السياسة لضمان مواءمتها مع أحدث إصدارات الضوابط التنظيمية الوطنية ذات العلاقة.',
    consultantDecision: {
      action: 'approve',
      notes: 'مستوى جيد جداً من الامتثال، مع ملاحظة بسيطة على تحديث الربط التنظيمي.',
      decidedAt: at(30),
      decidedBy: 'المستشار',
    },
  },
]

/** Aggregate, priority-ordered recommendations shown on the "التوصيات" tab. */
const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'mock_rec_asset',
    priority: 'critical',
    title: 'بناء سجل شامل لإدارة الأصول الرقمية والتقنية',
    why: 'غياب سجل موثق وشامل للأصول يزيد من مخاطر فقدان الرقابة على دورة حياتها الكاملة.',
    expectedImpact: 'خفض المخاطر التشغيلية ورفع نسبة الامتثال الإجمالية بشكل جوهري.',
    recommendedAction: 'اعتماد سياسة إدارة أصول شاملة تغطي التصنيف والوسم والإتلاف الآمن خلال 30 يوماً.',
    relatedControlIds: ['5-108-67'],
  },
  {
    id: 'mock_rec_kpi',
    priority: 'high',
    title: 'تفعيل آلية رسمية لمؤشرات الأداء الرئيسة',
    why: 'عدم اعتماد المؤشرات رسمياً يحدّ من قدرة الإدارة العليا على قياس جودة تنفيذ عمليات تقنية المعلومات.',
    expectedImpact: 'تحسين الرقابة المؤسسية على أداء الخدمات الرقمية.',
    recommendedAction: 'تطوير واعتماد مؤشرات أداء رئيسة رسمية مرتبطة بتقارير دورية.',
    relatedControlIds: ['5-108-106'],
  },
  {
    id: 'mock_rec_risk',
    priority: 'high',
    title: 'استكمال دورة إدارة مخاطر تقنية المعلومات',
    why: 'غياب آلية متابعة دورية موثقة يُبقي خطط معالجة المخاطر دون تحديث فعّال.',
    expectedImpact: 'تعزيز فعالية إدارة المخاطر ومواءمتها مع استمرارية الأعمال.',
    recommendedAction: 'إضافة آلية متابعة دورية للمخاطر وربطها بسجل المخاطر المؤسسي.',
    relatedControlIds: ['5-108-10'],
  },
  {
    id: 'mock_rec_audit',
    priority: 'medium',
    title: 'توسيع نطاق خطة التدقيق الداخلي',
    why: 'الخطة الحالية تغطي الجوانب التشغيلية فقط دون الحوكمة والكوادر البشرية.',
    expectedImpact: 'تغطية تدقيقية شاملة تتوافق مع متطلبات الضابط.',
    recommendedAction: 'تحديث خطة التدقيق لتشمل النطاقات الثلاثة المطلوبة كافة.',
    relatedControlIds: ['5-108-110'],
  },
  {
    id: 'mock_rec_policy',
    priority: 'low',
    title: 'تحديث سياسات تقنية المعلومات دورياً',
    why: 'مواءمة السياسات المعتمدة مع أحدث الضوابط التنظيمية الوطنية.',
    expectedImpact: 'الحفاظ على مستوى الامتثال المرتفع الحالي وتحسينه.',
    recommendedAction: 'مراجعة السياسة الرئيسة سنوياً ومطابقتها مع أي تحديثات تنظيمية.',
    relatedControlIds: ['5-108-06'],
  },
]

/** Roadmap shown on the "خطة العمل" tab. */
const MOCK_ACTION_PLAN: ActionPlanItem[] = [
  {
    id: 'mock_act_asset',
    priority: 'critical',
    task: 'اعتماد سياسة إدارة الأصول الرقمية والتقنية',
    owner: 'إدارة تقنية المعلومات',
    suggestedDuration: '30 يوماً',
    relatedControlIds: ['5-108-67'],
  },
  {
    id: 'mock_act_kpi',
    priority: 'high',
    task: 'اعتماد مؤشرات الأداء الرئيسة (KPIs)',
    owner: 'مكتب إدارة الأداء المؤسسي',
    suggestedDuration: '45 يوماً',
    relatedControlIds: ['5-108-106'],
  },
  {
    id: 'mock_act_risk',
    priority: 'high',
    task: 'استكمال إجراءات المتابعة الدورية لإدارة المخاطر',
    owner: 'إدارة المخاطر وتقنية المعلومات',
    suggestedDuration: '60 يوماً',
    relatedControlIds: ['5-108-10'],
  },
  {
    id: 'mock_act_audit',
    priority: 'medium',
    task: 'تحديث خطة التدقيق الداخلي لتقنية المعلومات',
    owner: 'إدارة التدقيق الداخلي',
    suggestedDuration: '90 يوماً',
    relatedControlIds: ['5-108-110'],
  },
]

/** Full analysis result — this is what `runComplianceAnalysis()` returns when
 * `MOCK_MODE_ENABLED` is true, in place of the real Gemini response. */
export const MOCK_ANALYSIS_RESULT: AnalysisResult = {
  generatedAt: at(24),
  modelVersion: 'mock-demo-data',
  complianceScore: 62,
  confidenceScore: 92,
  satisfiedCount: 3,
  partiallySatisfiedCount: 2,
  unsatisfiedCount: 2,
  criticalCount: 1,
  executiveSummary:
    'بناءً على التقييم الشامل لوثائق حوكمة تقنية المعلومات المرفوعة من شركة التقنية الوطنية، ومقارنتها بضوابط هيئة الحكومة الرقمية (DGA)، بلغت نسبة الامتثال الإجمالية 62٪. أظهرت الجهة التزاماً جيداً في الجوانب المؤسسية الأساسية، وعلى رأسها تشكيل اللجنة التوجيهية وتحديد الأدوار والمسؤوليات ومراجعة السياسات الداخلية، في حين تبرز فجوات جوهرية في إدارة الأصول الرقمية والتقنية ومؤشرات الأداء الرئيسة، إضافة إلى حاجة لتوسيع نطاق التدقيق الداخلي وإكمال دورة إدارة المخاطر. يوصى بمعالجة الفجوات الحرجة خلال الأرباع الثلاثة القادمة لرفع مستوى الامتثال إلى النطاق المستهدف.',
  strengths: [
    'تشكيل رسمي للجنة التوجيهية لحوكمة تقنية المعلومات بقرار من الإدارة العليا',
    'توصيف واضح ومعتمد للأدوار والمسؤوليات داخل إدارة تقنية المعلومات',
    'اعتماد وتعميم سياسات وإجراءات تقنية المعلومات بشكل منهجي',
  ],
  gapAnalysis:
    'تتركز أبرز الفجوات في غياب سجل موثق وشامل للأصول الرقمية والتقنية، وعدم اعتماد مؤشرات أداء رئيسة رسمية لقياس جودة تنفيذ عمليات تقنية المعلومات. كما لوحظ أن خطة التدقيق الداخلي الحالية لا تغطي نطاق الحوكمة والكوادر البشرية بالكامل، وأن دورة إدارة المخاطر تفتقر لآلية متابعة دورية موثقة. هذه الفجوات مجتمعة تُبقي الجهة عند مستوى امتثال متوسط رغم قوة الأساس المؤسسي القائم.',
  controlFindings: MOCK_CONTROL_FINDINGS,
  recommendations: MOCK_RECOMMENDATIONS,
  actionPlan: MOCK_ACTION_PLAN,
}

const MOCK_FILE_RECORD: UploadedFileRecord = {
  id: 'mock_file_1',
  name: MOCK_FILE_NAME,
  size: 812_000,
  mimeType: 'application/pdf',
  status: 'parsed',
  extractedText:
    'سياسة حوكمة تقنية المعلومات — شركة التقنية الوطنية (نص تجريبي لأغراض العرض؛ لا يُستخدم في وضع البيانات التجريبية لأن نتائج التقييم مأخوذة مباشرة من mockAssessment.ts).',
  pageCount: 28,
  uploadedAt: at(0),
}

/** Full assessment-level audit trail, including the consultant's overall
 * approval comment — this is the "Consultant comments" shown on سجل التدقيق. */
const MOCK_AUDIT_TRAIL: AuditEntry[] = [
  {
    id: 'mock_audit_1',
    timestamp: at(0),
    actor: 'client',
    actorLabel: 'العميل',
    decision: 'إنشاء تقييم جديد',
    notes: `تم إنشاء تقييم جديد لجهة: ${MOCK_ORGANIZATION_NAME}`,
  },
  { id: 'mock_audit_2', timestamp: at(1), actor: 'client', actorLabel: 'العميل', decision: 'بدء تحليل الامتثال' },
  {
    id: 'mock_audit_3',
    timestamp: at(2),
    actor: 'client',
    actorLabel: 'العميل',
    decision: 'اكتمال تحليل الذكاء الاصطناعي',
    notes: 'نسبة الامتثال المقدَّرة: 62٪',
  },
  { id: 'mock_audit_4', timestamp: at(3), actor: 'client', actorLabel: 'العميل', decision: 'إرسال للمستشار' },
  { id: 'mock_audit_5', timestamp: at(28), actor: 'consultant', actorLabel: 'المستشار', decision: 'اعتماد', controlId: '5-108-01', notes: 'تم التحقق من قرار التشكيل ومحاضر الاجتماعات — الضابط مستوفى بالكامل.' },
  { id: 'mock_audit_6', timestamp: at(28), actor: 'consultant', actorLabel: 'المستشار', decision: 'اعتماد', controlId: '5-108-09', notes: 'التوصيف موثق ومعتمد رسمياً، لا حاجة لإجراء إضافي حالياً.' },
  { id: 'mock_audit_7', timestamp: at(29), actor: 'consultant', actorLabel: 'المستشار', decision: 'اعتماد', controlId: '5-108-10', notes: 'أوافق على التصنيف الجزئي، ويُطلب استكمال آلية المتابعة الدورية خلال الربع القادم.' },
  { id: 'mock_audit_8', timestamp: at(29), actor: 'consultant', actorLabel: 'المستشار', decision: 'اعتماد', controlId: '5-108-67', notes: 'فجوة جوهرية تستدعي خطة تصحيحية عاجلة؛ صُنِّفت ضمن الأولويات الحرجة لخطة العمل.' },
  { id: 'mock_audit_9', timestamp: at(29), actor: 'consultant', actorLabel: 'المستشار', decision: 'اعتماد', controlId: '5-108-110', notes: 'خطة التدقيق تحتاج توسيعاً ليشمل الحوكمة والكوادر البشرية، أوافق على التصنيف الجزئي.' },
  { id: 'mock_audit_10', timestamp: at(29), actor: 'consultant', actorLabel: 'المستشار', decision: 'اعتماد', controlId: '5-108-106', notes: 'غياب الاعتماد الرسمي للمؤشرات يستدعي معالجة سريعة، أوصي بمتابعتها ضمن اجتماع اللجنة القادم.' },
  { id: 'mock_audit_11', timestamp: at(29), actor: 'consultant', actorLabel: 'المستشار', decision: 'اعتماد', controlId: '5-108-06', notes: 'مستوى جيد جداً من الامتثال، مع ملاحظة بسيطة على تحديث الربط التنظيمي.' },
  {
    id: 'mock_audit_12',
    timestamp: at(30),
    actor: 'consultant',
    actorLabel: 'المستشار',
    decision: 'اعتماد التقييم',
    notes:
      'تمت مراجعة جميع الضوابط السبعة، ونتائج التقييم متوافقة مع الأدلة المرفوعة. أوصي باعتماد التقرير النهائي مع متابعة الفجوات الحرجة (إدارة الأصول ومؤشرات الأداء) ضمن خطة عمل واضحة الجدول الزمني.',
  },
  { id: 'mock_audit_13', timestamp: at(32), actor: 'consultant', actorLabel: 'المستشار', decision: 'إصدار التقرير النهائي' },
]

/** Full, ready-to-view demo assessment. Seeded automatically into the store on
 * first run when `MOCK_MODE_ENABLED` is true and no assessments exist yet —
 * see `useAssessmentStore.ts`. */
export function buildMockAssessment(): Assessment {
  return {
    id: MOCK_ASSESSMENT_ID,
    frameworkId: 'DGA',
    domainId: 'it-governance',
    clientName: MOCK_CLIENT_NAME,
    organizationName: MOCK_ORGANIZATION_NAME,
    createdAt: at(0),
    updatedAt: at(32),
    status: 'finalized',
    files: [{ ...MOCK_FILE_RECORD }],
    analysis: buildMockAnalysisResult(),
    auditTrail: MOCK_AUDIT_TRAIL.map((entry) => ({ ...entry })),
    submittedAt: at(3),
    finalizedAt: at(32),
    reportVersion: 1,
  }
}

/** Deep-cloned copy of the mock analysis result, used by the analysis engine
 * so repeated "تحليل" runs never share object references with the store. */
export function buildMockAnalysisResult(): AnalysisResult {
  return structuredClone(MOCK_ANALYSIS_RESULT)
}
