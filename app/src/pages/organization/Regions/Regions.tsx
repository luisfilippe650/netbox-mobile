import { t } from "../../../i18n/language";
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
      title={t("Regiões")}
      subtitle={t("Consulte as regiões e seus vínculos com os racks.")}
      sectionTitle={t("Regiões cadastradas")}
      searchLabel={t("Regiões")}
      emptyMessage={t("Nenhuma região encontrada")}
      loadPage={loadPage}
      onCreate={onCreate}
      onDelete={onDelete}
      onBack={onBack}
    />
  );
}
