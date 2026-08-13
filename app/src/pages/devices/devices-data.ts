export type DeviceSummary = {
  id: string;
  name: string;
  site: string;
  region: string;
  rack: string;
  allocatedUnit: number;
  label: string;
  description: string;
};

export const initialDevices: readonly DeviceSummary[] = [
  {
    id: "1001",
    name: "Servidor principal",
    site: "INPE — São José dos Campos",
    region: "Sala A",
    rack: "Rack 12",
    allocatedUnit: 35,
    label: "SRV-PRINCIPAL-01",
    description: "Servidor principal de aplicações do datacenter.",
  },
  {
    id: "1002",
    name: "Switch core",
    site: "INPE — São José dos Campos",
    region: "Área de Rede",
    rack: "Rack de Rede 01",
    allocatedUnit: 40,
    label: "SW-CORE-01",
    description: "Switch principal da infraestrutura de rede.",
  },
  {
    id: "1003",
    name: "UPS",
    site: "INPE — São José dos Campos",
    region: "Sala A",
    rack: "Rack 12",
    allocatedUnit: 1,
    label: "UPS-PRINCIPAL-01",
    description: "Unidade de alimentação ininterrupta do rack.",
  },
];
