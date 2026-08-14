import {
  OrganizationList,
  type OrganizationCreateInput,
  type OrganizationItem,
} from "../../organization/OrganizationList/OrganizationList";

type DeviceFunctionsProps = {
  items: readonly OrganizationItem[];
  onCreate: (input: OrganizationCreateInput) => Promise<void>;
  onDelete: (ids: number[]) => Promise<void>;
  onBack: () => void;
};

export default function DeviceFunctions({
  items,
  onCreate,
  onDelete,
  onBack,
}: DeviceFunctionsProps) {
  return (
    <OrganizationList
      objectType="dcim.devicerole"
      singular="Função de equipamento"
      title="Funções de equipamentos"
      subtitle="Crie e gerencie as funções usadas nos equipamentos."
      sectionTitle="Funções cadastradas"
      searchLabel="Funções"
      emptyMessage="Nenhuma função de equipamento encontrada"
      items={items}
      onCreate={onCreate}
      onDelete={onDelete}
      onBack={onBack}
    />
  );
}
