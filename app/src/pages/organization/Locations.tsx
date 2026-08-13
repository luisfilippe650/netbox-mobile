import { OrganizationList, type OrganizationItem } from "./OrganizationList";

type LocationsProps = {
  onBack: () => void;
  items: readonly OrganizationItem[];
  sites: readonly OrganizationItem[];
  onItemsChange: (items: OrganizationItem[]) => void;
};

export default function Locations({
  onBack,
  items,
  sites,
  onItemsChange,
}: LocationsProps) {
  return (
    <OrganizationList
      singular="Local"
      title="Locais"
      subtitle="Visualize os locais cadastrados em cada site."
      sectionTitle="Locais cadastrados"
      searchLabel="Locais"
      emptyMessage="Nenhum local encontrado"
      items={items}
      siteOptions={sites}
      onItemsChange={onItemsChange}
      onBack={onBack}
    />
  );
}
