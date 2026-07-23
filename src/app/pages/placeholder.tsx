import { Construction } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'

export function Placeholder({ title, descricao }: { title: string; descricao: string }) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <PageHeader title={title} />
      <EmptyState icon={<Construction />} title="Em construção" description={descricao} />
    </div>
  )
}
