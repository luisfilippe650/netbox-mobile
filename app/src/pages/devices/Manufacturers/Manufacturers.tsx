import {
  OrganizationList,
  type OrganizationCreateInput,
  type OrganizationItem,
} from "../../organization/OrganizationList/OrganizationList";
import type { PageRequest, PageResult } from "../../../hooks/usePaginatedData";
import type { BatchDeleteResult } from "../../../services";

type ManufacturersProps = {
  loadPage: (request: PageRequest) => Promise<PageResult<OrganizationItem>>;
  onCreate: (input: OrganizationCreateInput) => Promise<void>;
  onDelete: (ids: number[]) => Promise<BatchDeleteResult>;
  onBack: () => void;
};

export default function Manufacturers({
  loadPage,
  onCreate,
  onDelete,
  onBack,
}: ManufacturersProps) {
  return (
    <OrganizationList
      objectType="dcim.manufacturer"
      singular="Fabricante"
      title="Fabricantes"
      subtitle="Crie e gerencie os fabricantes dos equipamentos."
      sectionTitle="Fabricantes cadastrados"
      searchLabel="Fabricantes"
      emptyMessage="Nenhum fabricante encontrado"
      loadPage={loadPage}
      onCreate={onCreate}
      onDelete={onDelete}
      onBack={onBack}
    />
  );
}
