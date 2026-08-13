import {
  OrganizationList,
  type OrganizationCreateInput,
  type OrganizationItem,
} from "../organization/OrganizationList";

type ManufacturersProps = {
  items: readonly OrganizationItem[];
  onCreate: (input: OrganizationCreateInput) => Promise<void>;
  onDelete: (ids: number[]) => Promise<void>;
  onBack: () => void;
};

export default function Manufacturers({
  items,
  onCreate,
  onDelete,
  onBack,
}: ManufacturersProps) {
  return (
    <OrganizationList
      singular="Fabricante"
      title="Fabricantes"
      subtitle="Crie e gerencie os fabricantes dos dispositivos."
      sectionTitle="Fabricantes cadastrados"
      searchLabel="Fabricantes"
      emptyMessage="Nenhum fabricante encontrado"
      items={items}
      onCreate={onCreate}
      onDelete={onDelete}
      onBack={onBack}
    />
  );
}
