import { useRef, useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReportDocument } from './ReportDocument'
import { exportElementToPdf } from '@/utils/pdf'
import type { Assessment } from '@/types/assessment'

export function ReportGenerator({ assessment }: { assessment: Assessment }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  async function handleDownload() {
    if (!ref.current) return
    setIsExporting(true)
    try {
      const filename = `ComplyAI-تقرير-${assessment.organizationName}.pdf`
      await exportElementToPdf(ref.current, filename)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div>
      <Button variant="gold" size="lg" onClick={handleDownload} disabled={isExporting || !assessment.analysis}>
        {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        تنزيل التقرير (PDF)
      </Button>

      <div className="pointer-events-none fixed left-[-9999px] top-0 opacity-0" aria-hidden="true">
        <ReportDocument ref={ref} assessment={assessment} />
      </div>
    </div>
  )
}
