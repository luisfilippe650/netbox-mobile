import {
  OrganizationList,
  type OrganizationCreateInput,
  type OrganizationItem,
} from "../OrganizationList/OrganizationList";
import type { PageRequest, PageResult } from "../../../hooks/usePaginatedData";
import type { BatchDeleteResult } from "../../../services";

type RegionsProps = {
  onBack: () => void;
  loadPage: (request: PageRequest) => Promise<PageResult<OrganizationItem>>;
  onCreate: (input: OrganizationCreateInput) => Promise<void>;
  onDelete: (ids: number[]) => Promise<BatchDeleteResult>;
};

export default function Regions({
  onBack,
  loadPage,
  onCreate,
  onDelete,
}: RegionsProps) {
  return (
    <OrganizationList
      objectType="dcim.region"
      singular="Região"
      title="Regiões"
      subtitle="Consulte as regiões e seus vínculos com os racks."
      sectionTitle="Regiões cadastradas"
      searchLabel="Regiões"
      emptyMessage="Nenhuma região encontrada"
      loadPage={loadPage}
      onCreate={onCreate}
      onDelete={onDelete}
      onBack={onBack}
    />
  );
}
