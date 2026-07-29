import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, FileText, Loader2, UploadCloud, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatFileSize } from '@/utils/format'
import { generateId } from '@/utils/id'
import { isSupportedFile, parseDocument } from '@/services/parser/documentParser'
import { useAssessmentStore } from '@/hooks/useAssessmentStore'
import type { UploadedFileRecord } from '@/types/assessment'

const STATUS_META: Record<UploadedFileRecord['status'], { label: string; className: string }> = {
  queued: { label: 'بالانتظار', className: 'text-[var(--color-muted-foreground)]' },
  parsing: { label: 'جارٍ استخراج النص…', className: 'text-[var(--color-status-info)]' },
  parsed: { label: 'جاهز للتحليل', className: 'text-[var(--color-status-success)]' },
  failed: { label: 'تعذّرت المعالجة', className: 'text-[var(--color-status-danger)]' },
}

export function FileUploader({
  assessmentId,
  disabled,
  autoOpen,
  onAutoOpenHandled,
}: {
  assessmentId: string
  disabled?: boolean
  /** When true on mount, immediately opens the native file picker (e.g. from an external "upload" button). */
  autoOpen?: boolean
  onAutoOpenHandled?: () => void
}) {
  const files = useAssessmentStore((s) => s.assessments.find((a) => a.id === assessmentId)?.files ?? [])
  const addFiles = useAssessmentStore((s) => s.addFiles)
  const updateFile = useAssessmentStore((s) => s.updateFile)
  const removeFile = useAssessmentStore((s) => s.removeFile)

  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoOpen && !disabled) {
      inputRef.current?.click()
      onAutoOpenHandled?.()
    }
  }, [autoOpen, disabled, onAutoOpenHandled])

  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const incoming = Array.from(fileList).filter(isSupportedFile)
      if (incoming.length === 0) return

      const records: UploadedFileRecord[] = incoming.map((file) => ({
        id: generateId('file'),
        name: file.name,
        size: file.size,
        mimeType: file.type,
        status: 'queued',
        uploadedAt: new Date().toISOString(),
      }))
      addFiles(assessmentId, records)

      incoming.forEach(async (file, index) => {
        const fileId = records[index].id
        updateFile(assessmentId, fileId, { status: 'parsing' })
        try {
          const parsed = await parseDocument(file)
          updateFile(assessmentId, fileId, {
            status: 'parsed',
            extractedText: parsed.text,
            pageCount: parsed.pageCount,
          })
        } catch (err) {
          updateFile(assessmentId, fileId, {
            status: 'failed',
            error: err instanceof Error ? err.message : 'خطأ غير معروف أثناء استخراج النص',
          })
        }
      })
    },
    [assessmentId, addFiles, updateFile],
  )

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          if (!disabled) void processFiles(e.dataTransfer.files)
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors',
          disabled
            ? 'cursor-not-allowed border-[var(--color-border)] bg-[var(--color-muted)]/50 opacity-60'
            : 'cursor-pointer border-[var(--color-brand-navy-200)] bg-white hover:border-[var(--color-brand-gold)] hover:bg-[var(--color-brand-gold-50)]',
          isDragging && 'border-[var(--color-brand-gold)] bg-[var(--color-brand-gold-50)]',
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-navy-50)] text-[var(--color-primary)]">
          <UploadCloud className="h-7 w-7" />
        </div>
        <div>
          <p className="font-semibold text-[var(--color-primary)]">اسحب الملفات هنا أو اضغط للاختيار</p>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">صيغ مدعومة: PDF، DOCX</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          multiple
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files) void processFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((file) => {
            const meta = STATUS_META[file.status]
            return (
              <li
                key={file.id}
                className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3"
              >
                <FileText className="h-5 w-5 shrink-0 text-[var(--color-brand-navy-400)]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--color-foreground)]">{file.name}</p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    {formatFileSize(file.size)}
                    {file.pageCount ? ` · ${file.pageCount} صفحة` : ''}
                  </p>
                </div>
                <div className={cn('flex items-center gap-1.5 text-xs font-medium', meta.className)}>
                  {file.status === 'parsing' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {file.status === 'parsed' && <CheckCircle2 className="h-3.5 w-3.5" />}
                  {file.status === 'failed' && <AlertCircle className="h-3.5 w-3.5" />}
                  {meta.label}
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeFile(assessmentId, file.id)}
                    className="text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-destructive)]"
                    aria-label="إزالة الملف"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export function ClearFilesHint() {
  return (
    <p className="text-xs text-[var(--color-muted-foreground)]">
      يتم استخراج النص من الملفات داخل المتصفح فقط، ولا تُرفع الوثائق إلى أي خادم خارجي عدا نداء تحليل الذكاء
      الاصطناعي.
    </p>
  )
}
