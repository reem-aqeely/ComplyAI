import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAssessmentStore } from '@/hooks/useAssessmentStore'

const schema = z.object({
  organizationName: z.string().min(2, 'اسم الجهة مطلوب'),
  clientName: z.string().min(2, 'اسم المسؤول عن التقييم مطلوب'),
})

type FormValues = z.infer<typeof schema>

export function NewAssessmentPage() {
  const navigate = useNavigate()
  const createAssessment = useAssessmentStore((s) => s.createAssessment)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  function onSubmit(values: FormValues) {
    const id = createAssessment({ domainId: 'it-governance', ...values })
    navigate(`/assessments/${id}`)
  }

  return (
    <div className="mx-auto max-w-xl">
      <Card className="p-2">
        <CardHeader className="items-center text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-brand-navy-50)] text-[var(--color-primary)]">
            <ClipboardList className="h-6 w-6" />
          </div>
          <CardTitle className="mt-2">تقييم امتثال جديد</CardTitle>
          <CardDescription>حوكمة تقنية المعلومات — هيئة الحكومة الرقمية</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="organizationName">اسم الجهة الحكومية</Label>
              <Input id="organizationName" placeholder="مثال: وزارة النموذج" {...register('organizationName')} />
              {errors.organizationName && (
                <p className="text-xs text-[var(--color-destructive)]">{errors.organizationName.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="clientName">اسم المسؤول عن التقييم</Label>
              <Input id="clientName" placeholder="مثال: م. عبدالله السالم" {...register('clientName')} />
              {errors.clientName && (
                <p className="text-xs text-[var(--color-destructive)]">{errors.clientName.message}</p>
              )}
            </div>
            <Button type="submit" size="lg" variant="gold" disabled={isSubmitting}>
              بدء التقييم
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
