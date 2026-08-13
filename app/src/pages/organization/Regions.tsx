import { OrganizationList, type OrganizationCreateInput, type OrganizationItem } from "./OrganizationList";

type RegionsProps = {
  onBack: () => void;
  items: readonly OrganizationItem[];
  onCreate: (input: OrganizationCreateInput) => Promise<void>;
  onDelete: (ids: number[]) => Promise<void>;
};

export default function Regions({ onBack, items, onCreate, onDelete }: RegionsProps) {
  return (
    <OrganizationList singular="Região" title="Regiões"
      subtitle="Consulte as regiões e seus vínculos com os racks."
      sectionTitle="Regiões cadastradas" searchLabel="Regiões"
      emptyMessage="Nenhuma região encontrada" items={items}
      onCreate={onCreate} onDelete={onDelete} onBack={onBack} />
  );
}
