import type { ControlRecord } from '@/types/knowledge-base'

export interface DocumentInput {
  fileName: string
  text: string
}

const MAX_CHARS_PER_DOCUMENT = 60_000

export const SYSTEM_INSTRUCTION = `أنت مستشار خبير في حوكمة تقنية المعلومات، متخصص في ضوابط هيئة الحكومة الرقمية السعودية (DGA).
مهمتك مقارنة الوثائق الحكومية المرفوعة من العميل بضوابط الحوكمة المرجعية، وإصدار تقييم امتثال دقيق وموضوعي.

قواعد صارمة يجب الالتزام بها دائماً:
1. لا تختلق أي دليل إطلاقاً. استند فقط إلى ما ورد فعلياً في نص الوثائق المرفقة.
2. إن لم تجد في الوثائق ما يدعم ضابطاً معيناً، اكتب في حقل evidence النص الحرفي التالي بالضبط: "لم يتم العثور على دليل يدعم هذا الضابط." واجعل status = "non_compliant".
3. كل استنتاج (reasoning) يجب أن يفسر بوضوح سبب القرار استناداً إلى الدليل أو غيابه.
4. استخدم لغة عربية فصحى استشارية احترافية، بأسلوب يشبه تقارير كبرى شركات الاستشارات الإدارية.
5. أعد الاستجابة بصيغة JSON فقط، مطابقة تماماً للمخطط المحدد، دون أي نص خارج JSON.
6. أنت مساعد فقط؛ لا تصدر قراراً نهائياً — القرار النهائي يعود دائماً للمستشار البشري.
7. غطِّ كل ضابط من الضوابط المرسلة إليك بنتيجة واحدة على الأقل في controlFindings — لا تُغفل أي ضابط.
8. الحكم على كل ضابط يكون بمقارنة نص الضابط المرجعي بما ورد في الوثائق حصراً، ضابطاً بضابط. لا تحكم على الوثيقة إجمالاً، ولا تستنتج امتثالاً من سياق عام أو من ممارسات مفترضة غير مذكورة صراحةً.
9. معايير تحديد الحالة (status) — التزم بها حرفياً:
   - "compliant": الوثائق تغطي صراحةً كل ما يطلبه نص الضابط (وكل متطلباته الفرعية إن وُجدت).
   - "partially_compliant": الوثائق تغطي جزءاً من متطلبات الضابط وتُغفل جزءاً آخر.
   - "non_compliant": لا يوجد في الوثائق أي دليل يدعم الضابط.
10. إذا احتوى الضابط على متطلبات فرعية (sub_requirements) فهي جزء لا يتجزأ من الضابط الأب — قيّمها جميعاً ضمن نتيجة الضابط الأب، ولا تُصدر لها نتائج مستقلة.`

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max)}\n... [تم اقتصاص النص لتجاوزه الحد الأقصى للطول] ...`
}

export function buildAnalysisPrompt(controls: ControlRecord[], documents: DocumentInput[]): string {
  // 13 of the DGA main controls end in a colon ("... على أن يتكون أعضاء اللجنة من:")
  // because the requirement they introduce is enumerated in their sub-controls.
  // Sending the parent alone leaves the model judging an unfinished sentence, so
  // nest each parent's sub-controls under it. Callers that pass only main
  // controls keep the previous payload shape.
  const subControlsByParent = new Map<string, ControlRecord[]>()
  for (const c of controls) {
    if (!c.parentId) continue
    const siblings = subControlsByParent.get(c.parentId) ?? []
    siblings.push(c)
    subControlsByParent.set(c.parentId, siblings)
  }

  const controlsPayload = controls
    .filter((c) => !c.isSubControl)
    .map((c) => {
      const subControls = subControlsByParent.get(c.controlId) ?? []
      return {
        control_id: c.controlId,
        domain: c.domainTitle,
        level: c.levelTitle,
        text: c.text,
        ...(subControls.length > 0 && {
          sub_requirements: subControls.map((s) => ({ id: s.controlId, text: s.text })),
        }),
        source_page_in_framework: c.sourcePage,
      }
    })

  const documentsPayload = documents
    .map(
      (d, i) =>
        `--- بداية الوثيقة ${i + 1}: "${d.fileName}" ---\n${truncate(d.text, MAX_CHARS_PER_DOCUMENT)}\n--- نهاية الوثيقة ${i + 1} ---`,
    )
    .join('\n\n')

  return `# ضوابط التقييم المرجعية (هيئة الحكومة الرقمية)
قارن الوثائق أدناه بكل ضابط من الضوابط التالية (بصيغة JSON):

${JSON.stringify(controlsPayload, null, 0)}

# الوثائق المرفوعة من العميل

${documentsPayload || 'لم يتم إرفاق أي وثائق قابلة لاستخراج النص.'}

# المطلوب

قيّم امتثال الجهة لكل ضابط من الضوابط المرجعية أعلاه بناءً فقط على محتوى الوثائق المرفقة، وأعد النتيجة بصيغة JSON مطابقة للمخطط المحدد في الطلب.`
}
