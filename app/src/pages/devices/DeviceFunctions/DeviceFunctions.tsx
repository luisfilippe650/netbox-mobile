import {
  OrganizationList,
  type OrganizationCreateInput,
  type OrganizationItem,
} from "../../organization/OrganizationList/OrganizationList";
import type { PageRequest, PageResult } from "../../../hooks/usePaginatedData";
import type { BatchDeleteResult } from "../../../services";

type DeviceFunctionsProps = {
  loadPage: (request: PageRequest) => Promise<PageResult<OrganizationItem>>;
  onCreate: (input: OrganizationCreateInput) => Promise<void>;
  onDelete: (ids: number[]) => Promise<BatchDeleteResult>;
  onBack: () => void;
};

export default function DeviceFunctions({
  loadPage,
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
      loadPage={loadPage}
      onCreate={onCreate}
      onDelete={onDelete}
      onBack={onBack}
    />
  );
}
