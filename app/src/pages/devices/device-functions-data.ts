import type { OrganizationItem } from "../organization/OrganizationList";

export const initialDeviceFunctions: readonly OrganizationItem[] = [
  {
    id: "FUN-01",
    name: "Servidor",
    description: "Função destinada aos servidores físicos",
    detail: "Função da VM: Não · Cor: Cinza",
    vmRole: false,
    color: "Cinza",
  },
  {
    id: "FUN-02",
    name: "Máquina virtual",
    description: "Função destinada aos dispositivos virtuais",
    detail: "Função da VM: Sim · Cor: Cinza",
    vmRole: true,
    color: "Cinza",
  },
  {
    id: "FUN-03",
    name: "Rede",
    description: "Função destinada aos equipamentos de rede",
    detail: "Função da VM: Não · Cor: Cinza",
    vmRole: false,
    color: "Cinza",
  },
];
