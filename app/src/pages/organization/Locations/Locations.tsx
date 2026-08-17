import {
  OrganizationList,
  type OrganizationCreateInput,
  type OrganizationItem,
} from "../OrganizationList/OrganizationList";
import type { PageRequest, PageResult } from "../../../hooks/usePaginatedData";
import type { BatchDeleteResult } from "../../../services";

type LocationsProps = {
  onBack: () => void;
  loadPage: (request: PageRequest) => Promise<PageResult<OrganizationItem>>;
  sites: readonly OrganizationItem[];
  onCreate: (input: OrganizationCreateInput) => Promise<void>;
  onDelete: (ids: number[]) => Promise<BatchDeleteResult>;
};

export default function Locations({
  onBack,
  loadPage,
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
      loadPage={loadPage}
      siteOptions={sites}
      onCreate={onCreate}
      onDelete={onDelete}
      onBack={onBack}
    />
  );
}
