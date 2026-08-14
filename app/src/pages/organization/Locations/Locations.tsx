import {
  OrganizationList,
  type OrganizationCreateInput,
  type OrganizationItem,
} from "../OrganizationList/OrganizationList";

type LocationsProps = {
  onBack: () => void;
  items: readonly OrganizationItem[];
  sites: readonly OrganizationItem[];
  onCreate: (input: OrganizationCreateInput) => Promise<void>;
  onDelete: (ids: number[]) => Promise<void>;
};

export default function Locations({
  onBack,
  items,
  sites,
  onCreate,
  onDelete,
}: LocationsProps) {
  return (
    <OrganizationList
      objectType="dcim.location"
      singular="Local"
      title="Locais"
      subtitle="Visualize os locais cadastrados em cada site."
      sectionTitle="Locais cadastrados"
      searchLabel="Locais"
      emptyMessage="Nenhum local encontrado"
      items={items}
      siteOptions={sites}
      onCreate={onCreate}
      onDelete={onDelete}
      onBack={onBack}
    />
  );
}
