import { OrganizationList, type OrganizationItem } from './OrganizationList'

type SitesProps = {
  onBack: () => void
  items: readonly OrganizationItem[]
  onItemsChange: (items: OrganizationItem[]) => void
}

export default function Sites({ onBack, items, onItemsChange }: SitesProps) {
  return (
    <OrganizationList
      singular="Site"
      title="Sites"
      subtitle="Consulte os sites que fazem parte da infraestrutura."
      sectionTitle="Sites cadastrados"
      searchLabel="Sites"
      emptyMessage="Nenhum site encontrado"
      items={items}
      onItemsChange={onItemsChange}
      onBack={onBack}
    />
  )
}
