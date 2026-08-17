import {
  OrganizationList,
  type OrganizationCreateInput,
  type OrganizationItem,
} from "../../organization/OrganizationList/OrganizationList";
import type { PageRequest, PageResult } from "../../../hooks/usePaginatedData";
import type { BatchDeleteResult } from "../../../services";

type RackRolesProps = {
  loadPage: (request: PageRequest) => Promise<PageResult<OrganizationItem>>;
  onCreate: (input: OrganizationCreateInput) => Promise<void>;
  onDelete: (ids: number[]) => Promise<BatchDeleteResult>;
  onBack: () => void;
};

export default function RackRoles({
  loadPage,
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
      loadPage={loadPage}
      onCreate={onCreate}
      onDelete={onDelete}
      onBack={onBack}
    />
  );
}
