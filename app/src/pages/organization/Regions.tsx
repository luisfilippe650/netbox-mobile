import { OrganizationList, type OrganizationItem } from "./OrganizationList";

type RegionsProps = {
  onBack: () => void;
};

const regions: readonly OrganizationItem[] = [
  {
    id: "REG-01",
    name: "Sala A",
    description: "Datacenter Principal",
    detail: "4 racks vinculados",
  },
  {
    id: "REG-02",
    name: "Sala B",
    description: "Datacenter Principal",
    detail: "3 racks vinculados",
  },
  {
    id: "REG-03",
    name: "Área de Rede",
    description: "Sala de Telecomunicações",
    detail: "2 racks vinculados",
  },
];

export default function Regions({ onBack }: RegionsProps) {
  return (
    <OrganizationList
      singular="Região"
      title="Regiões"
      subtitle="Consulte as regiões e seus vínculos com os racks."
      sectionTitle="Regiões cadastradas"
      searchLabel="Regiões"
      emptyMessage="Nenhuma região encontrada"
      items={regions}
      onBack={onBack}
    />
  );
}
