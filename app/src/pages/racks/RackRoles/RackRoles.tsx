import {
  OrganizationList,
  type OrganizationCreateInput,
  type OrganizationItem,
} from "../../organization/OrganizationList/OrganizationList";

type RackRolesProps = {
  items: readonly OrganizationItem[];
  onCreate: (input: OrganizationCreateInput) => Promise<void>;
  onDelete: (ids: number[]) => Promise<void>;
  onBack: () => void;
};

export default function RackRoles({
  items,
  onCreate,
  onDelete,
  onBack,
}: RackRolesProps) {
  return (
    <OrganizationList
      objectType="dcim.rackrole"
      singular="Função de rack"
      title="Funções de racks"
      subtitle="Crie e gerencie as funções atribuídas aos racks."
      sectionTitle="Funções cadastradas"
      searchLabel="Funções de racks"
      emptyMessage="Nenhuma função de rack encontrada"
      items={items}
      onCreate={onCreate}
      onDelete={onDelete}
      onBack={onBack}
    />
  );
}
