import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReserveDialog } from '../components/reserve-dialog'
import { ResourceInventory } from '../components/resource-inventory'
import { LabCalendar } from '../components/lab-calendar'
import { MeusRecursos } from '../components/meus-recursos'
import { LabMural } from '../components/lab-mural'

export function LabPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <PageHeader
        title="Lab & recursos"
        description="Licenças, servidores, portas e contas de demonstração — sem sobreposição de reservas."
        actions={
          <ReserveDialog
            trigger={
              <Button size="sm">
                <Plus /> Reservar laboratório
              </Button>
            }
          />
        }
      />
      <Tabs defaultValue="inventario">
        <TabsList>
          <TabsTrigger value="inventario">Inventário</TabsTrigger>
          <TabsTrigger value="calendario">Calendário</TabsTrigger>
          <TabsTrigger value="meus">Meus recursos</TabsTrigger>
          <TabsTrigger value="mural">Mural</TabsTrigger>
        </TabsList>
        <TabsContent value="inventario">
          <ResourceInventory />
        </TabsContent>
        <TabsContent value="calendario">
          <LabCalendar />
        </TabsContent>
        <TabsContent value="meus">
          <MeusRecursos />
        </TabsContent>
        <TabsContent value="mural">
          <LabMural />
        </TabsContent>
      </Tabs>
    </div>
  )
}
