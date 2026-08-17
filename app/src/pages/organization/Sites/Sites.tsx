import {
  OrganizationList,
  type OrganizationCreateInput,
  type OrganizationItem,
} from "../OrganizationList/OrganizationList";
import type { PageRequest, PageResult } from "../../../hooks/usePaginatedData";
import type { BatchDeleteResult } from "../../../services";

type SitesProps = {
  onBack: () => void;
  loadPage: (request: PageRequest) => Promise<PageResult<OrganizationItem>>;
  regions: readonly OrganizationItem[];
  onCreate: (input: OrganizationCreateInput) => Promise<void>;
  onDelete: (ids: number[]) => Promise<BatchDeleteResult>;
};

export default function Sites({
  onBack,
  loadPage,
  regions,
  onCreate,
  onDelete,
}: SitesProps) {
  return (
    <OrganizationList
      objectType="dcim.site"
      singular="Site"
      title="Sites"
      subtitle="Consulte os sites que fazem parte da infraestrutura."
      sectionTitle="Sites cadastrados"
      searchLabel="Sites"
      emptyMessage="Nenhum site encontrado"
      loadPage={loadPage}
      regionOptions={regions}
      onCreate={onCreate}
      onDelete={onDelete}
      onBack={onBack}
    />
  );
}
