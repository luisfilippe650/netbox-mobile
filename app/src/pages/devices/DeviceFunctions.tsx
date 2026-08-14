import {
  OrganizationList,
  type OrganizationCreateInput,
  type OrganizationItem,
} from "../organization/OrganizationList";

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
      singular="Função de dispositivo"
      title="Funções de dispositivos"
      subtitle="Crie e gerencie as funções usadas nos dispositivos."
      sectionTitle="Funções cadastradas"
      searchLabel="Funções"
      emptyMessage="Nenhuma função de dispositivo encontrada"
      items={items}
      onCreate={onCreate}
      onDelete={onDelete}
      onBack={onBack}
    />
  );
}
