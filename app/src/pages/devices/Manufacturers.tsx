import { OrganizationList, type OrganizationItem } from '../organization/OrganizationList'

type ManufacturersProps = {
  items: readonly OrganizationItem[]
  onItemsChange: (items: OrganizationItem[]) => void
  onBack: () => void
}

export default function Manufacturers({ items, onItemsChange, onBack }: ManufacturersProps) {
  return (
    <OrganizationList
      singular="Fabricante"
      title="Fabricantes"
      subtitle="Crie e gerencie os fabricantes dos dispositivos."
      sectionTitle="Fabricantes cadastrados"
      searchLabel="Fabricantes"
      emptyMessage="Nenhum fabricante encontrado"
      items={items}
      onItemsChange={onItemsChange}
      onBack={onBack}
    />
  )
}
