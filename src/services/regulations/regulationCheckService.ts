import { knowledgeBaseService } from '@/services/knowledge-base/knowledgeBaseService'
import type { KnowledgeBaseFile } from '@/types/knowledge-base'
import type { RegulationUpdateCheck } from '@/types/regulation'

export const LATEST_KNOWN_VERSION = '3.1'

const NEW_CONTROL_ID = '5-108-121'
const MODIFIED_CONTROL_ID = '5-108-01'
const REMOVED_CONTROL_ID_SUFFIX = '.03'

function findRemovedControlId(kb: KnowledgeBaseFile): string | undefined {
  return kb.flat_controls.find((c) => c.control_id.endsWith(REMOVED_CONTROL_ID_SUFFIX) && c.parent_id)?.control_id
}

/** Simulates checking the DGA website for a newer framework version. No network call is made. */
export async function checkForRegulationUpdates(currentVersion: string): Promise<RegulationUpdateCheck> {
  await new Promise((resolve) => setTimeout(resolve, 1400))

  if (currentVersion === LATEST_KNOWN_VERSION) {
    return {
      checkedAt: new Date().toISOString(),
      hasUpdate: false,
      currentVersion,
    }
  }

  const kb = knowledgeBaseService.getFrameworkFile('DGA')
  const modified = kb?.flat_controls.find((c) => c.control_id === MODIFIED_CONTROL_ID)
  const removedId = kb ? findRemovedControlId(kb) : undefined
  const removed = kb?.flat_controls.find((c) => c.control_id === removedId)

  return {
    checkedAt: new Date().toISOString(),
    hasUpdate: true,
    currentVersion,
    newVersion: LATEST_KNOWN_VERSION,
    newControls: [
      {
        controlId: NEW_CONTROL_ID,
        domainTitle: 'ضوابط إدارة العمليات',
        text: 'تُنشئ الجهة الحكومية آلية لمراجعة دورية سنوية لفعالية ضوابط حوكمة الذكاء الاصطناعي المطبقة داخل الجهة، وتوثيق نتائج المراجعة ورفعها للجنة التوجيهية لحوكمة تقنية المعلومات.',
      },
    ],
    modifiedControls: modified
      ? [
          {
            controlId: modified.control_id,
            domainTitle: modified.domain_title,
            text: `${modified.text} (تحديث: يُشترط توثيق قرار التشكيل رسمياً واعتماده من الإدارة العليا خلال 30 يوماً من صدور هذا التحديث).`,
          },
        ]
      : [],
    removedControls: removed ? [{ controlId: removed.control_id, domainTitle: removed.domain_title, text: removed.text }] : [],
    summary:
      'يضيف الإصدار 3.1 ضابطاً جديداً متعلقاً بالمراجعة الدورية لفعالية حوكمة الذكاء الاصطناعي، ويُحكم متطلبات توثيق تشكيل اللجنة التوجيهية، مع حذف أحد المتطلبات الفرعية التي أصبحت مشمولة ضمن ضوابط أخرى.',
    expectedImpact:
      'يتطلب مراجعة تشكيل اللجنة التوجيهية الحالية وتوثيق آلية المراجعة السنوية. الأثر على نتائج التقييمات القائمة محدود ولا يُغيّر نسبة الامتثال الإجمالية بشكل جوهري.',
  }
}

export function applyRegulationUpdate(currentVersion: string): KnowledgeBaseFile | undefined {
  const kb = knowledgeBaseService.getFrameworkFile('DGA')
  if (!kb) return undefined
  if (currentVersion === LATEST_KNOWN_VERSION) return kb

  const removedId = findRemovedControlId(kb)

  const updatedFlatControls = kb.flat_controls
    .filter((c) => c.control_id !== removedId)
    .map((c) =>
      c.control_id === MODIFIED_CONTROL_ID
        ? {
            ...c,
            text: `${c.text} (تحديث: يُشترط توثيق قرار التشكيل رسمياً واعتماده من الإدارة العليا خلال 30 يوماً من صدور هذا التحديث).`,
          }
        : c,
    )
    .concat({
      control_id: NEW_CONTROL_ID,
      text: 'تُنشئ الجهة الحكومية آلية لمراجعة دورية سنوية لفعالية ضوابط حوكمة الذكاء الاصطناعي المطبقة داخل الجهة، وتوثيق نتائج المراجعة ورفعها للجنة التوجيهية لحوكمة تقنية المعلومات.',
      level_id: '7.1',
      level_title: 'إدارة تقنية المعلومات',
      domain_id: '7.1.1',
      domain_title: 'ضوابط إدارة العمليات',
      source_page: kb.flat_controls[0]?.source_page ?? 10,
    })

  const updatedLevels = kb.levels.map((level) => ({
    ...level,
    subdomains: level.subdomains.map((sub) => ({
      ...sub,
      controls: sub.controls
        .filter((c) => c.control_id !== removedId)
        .map((c) => ({
          ...c,
          text: c.control_id === MODIFIED_CONTROL_ID ? updatedFlatControls.find((u) => u.control_id === c.control_id)?.text ?? c.text : c.text,
          sub_controls: c.sub_controls?.filter((sc) => sc.control_id !== removedId),
        }))
        .concat(
          sub.id === '7.1.1'
            ? [
                {
                  control_id: NEW_CONTROL_ID,
                  text: updatedFlatControls.find((u) => u.control_id === NEW_CONTROL_ID)?.text ?? '',
                  level_id: '7.1',
                  level_title: 'إدارة تقنية المعلومات',
                  domain_id: '7.1.1',
                  domain_title: 'ضوابط إدارة العمليات',
                  source_page: kb.flat_controls[0]?.source_page ?? 10,
                  sub_controls: [],
                },
              ]
            : [],
        ),
    })),
  }))

  return {
    ...kb,
    framework: { ...kb.framework, version: LATEST_KNOWN_VERSION },
    meta: {
      ...kb.meta,
      total_controls: updatedFlatControls.length,
      main_controls: updatedFlatControls.filter((c) => !c.parent_id).length,
      sub_controls: updatedFlatControls.filter((c) => c.parent_id).length,
    },
    levels: updatedLevels,
    flat_controls: updatedFlatControls,
  }
}
