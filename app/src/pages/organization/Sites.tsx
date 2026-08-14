import { OrganizationList, type OrganizationCreateInput, type OrganizationItem } from "./OrganizationList";

type SitesProps = {
  onBack: () => void;
  items: readonly OrganizationItem[];
  regions: readonly OrganizationItem[];
  onCreate: (input: OrganizationCreateInput) => Promise<void>;
  onDelete: (ids: number[]) => Promise<void>;
};

export default function Sites({ onBack, items, regions, onCreate, onDelete }: SitesProps) {
  return (
    <OrganizationList
      objectType="dcim.site"
      singular="Site"
      title="Sites"
      subtitle="Consulte os sites que fazem parte da infraestrutura."
      sectionTitle="Sites cadastrados"
      searchLabel="Sites"
      emptyMessage="Nenhum site encontrado"
      items={items}
      regionOptions={regions}
      onCreate={onCreate}
      onDelete={onDelete}
      onBack={onBack}
    />
  );
}
