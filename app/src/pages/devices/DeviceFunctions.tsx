import { OrganizationList, type OrganizationItem } from '../organization/OrganizationList'

type DeviceFunctionsProps = {
  items: readonly OrganizationItem[]
  onItemsChange: (items: OrganizationItem[]) => void
  onBack: () => void
}

export default function DeviceFunctions({ items, onItemsChange, onBack }: DeviceFunctionsProps) {
  return (
    <OrganizationList
      singular="Função de dispositivo"
      title="Funções de dispositivos"
      subtitle="Crie e gerencie as funções usadas nos dispositivos."
      sectionTitle="Funções cadastradas"
      searchLabel="Funções"
      emptyMessage="Nenhuma função de dispositivo encontrada"
      items={items}
      onItemsChange={onItemsChange}
      onBack={onBack}
    />
  )
}
