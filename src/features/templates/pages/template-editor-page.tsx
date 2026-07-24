import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { FieldError } from '@/components/shared/field-error'
import { Markdown } from '@/components/shared/markdown'
import { templateSchema, TEMPLATE_TIPOS, tipoLabel, type TemplateInput } from '../schemas'
import { useCreateTemplate, useTemplate, useUpdateTemplate } from '../hooks'

export function TemplateEditorPage() {
  const { id } = useParams<{ id: string }>()
  const editing = Boolean(id)
  const existing = useTemplate(id)
  const create = useCreateTemplate()
  const update = useUpdateTemplate()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TemplateInput>({
    resolver: zodResolver(templateSchema),
    defaultValues: { tipo: 'proposta', titulo: '', conteudo_md: '', tags: '' },
  })

  useEffect(() => {
    if (existing.data) {
      reset({
        tipo: existing.data.tipo,
        titulo: existing.data.titulo,
        conteudo_md: existing.data.conteudo_md,
        tags: existing.data.tags.join(', '),
      })
    }
  }, [existing.data, reset])

  const preview = watch('conteudo_md') || '_Comece a escrever para ver a prévia._'

  async function onSubmit(values: TemplateInput) {
    try {
      if (editing && id) await update.mutateAsync({ id, values })
      else await create.mutateAsync(values)
      toast.success(editing ? 'Template atualizado' : 'Template criado')
      navigate('/templates')
    } catch {
      toast.error('Não foi possível salvar o template.')
    }
  }

  if (editing && existing.isLoading) {
    return (
      <div className="px-6 py-8">
        <Skeleton className="h-[70vh]" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-6xl px-6 py-8">
      <Link
        to="/templates"
        className="mb-4 inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" /> Templates
      </Link>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex min-w-56 flex-1 flex-col gap-1.5">
          <Label htmlFor="tpl-titulo">Título</Label>
          <Input id="tpl-titulo" {...register('titulo')} />
          <FieldError message={errors.titulo?.message} />
        </div>
        <div className="flex w-40 flex-col gap-1.5">
          <Label>Tipo</Label>
          <Controller
            control={control}
            name="tipo"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_TIPOS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {tipoLabel[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="flex w-56 flex-col gap-1.5">
          <Label htmlFor="tpl-tags">Tags</Label>
          <Input id="tpl-tags" placeholder="rfp, wan" {...register('tags')} />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando…' : editing ? 'Salvar' : 'Criar template'}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tpl-md">Markdown</Label>
          <Textarea
            id="tpl-md"
            className="min-h-[60vh] font-mono text-[13px] leading-relaxed"
            {...register('conteudo_md')}
          />
          <FieldError message={errors.conteudo_md?.message} />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-ink">Prévia</span>
          <div className="min-h-[60vh] overflow-auto rounded-md border border-line bg-surface p-4">
            <Markdown>{preview}</Markdown>
          </div>
        </div>
      </div>
    </form>
  )
}
