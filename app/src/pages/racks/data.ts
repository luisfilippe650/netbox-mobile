export type RackDevice = {
  id: string;
  name: string;
  role: string;
  startingUnit: number;
  height: number;
  status: "Ativo" | "Manutenção";
};

export type RackSummary = {
  id: string;
  name: string;
  site: string;
  location: string;
  group: string;
  height: number;
  width: number;
  devices: readonly RackDevice[];
};

export const racks: readonly RackSummary[] = [
  {
    id: "RACK-01",
    name: "Rack 12",
    site: "INPE — São José dos Campos",
    location: "Datacenter Principal",
    group: "Fileira principal",
    height: 42,
    width: 19,
    devices: [
      {
        id: "1001",
        name: "Servidor principal",
        role: "Servidor de aplicação",
        startingUnit: 35,
        height: 2,
        status: "Ativo",
      },
      {
        id: "1004",
        name: "Host de virtualização",
        role: "Servidor de virtualização",
        startingUnit: 30,
        height: 2,
        status: "Ativo",
      },
      {
        id: "1005",
        name: "Storage INPE-01",
        role: "Armazenamento",
        startingUnit: 20,
        height: 4,
        status: "Ativo",
      },
      {
        id: "1003",
        name: "UPS principal",
        role: "Energia",
        startingUnit: 1,
        height: 4,
        status: "Ativo",
      },
    ],
  },
  {
    id: "RACK-02",
    name: "Rack de Rede 01",
    site: "INPE — São José dos Campos",
    location: "Sala de Telecomunicações",
    group: "Rede principal",
    height: 42,
    width: 19,
    devices: [
      {
        id: "1002",
        name: "Switch core",
        role: "Rede",
        startingUnit: 40,
        height: 1,
        status: "Ativo",
      },
      {
        id: "1006",
        name: "Firewall principal",
        role: "Segurança",
        startingUnit: 37,
        height: 1,
        status: "Ativo",
      },
    ],
  },
  {
    id: "RACK-03",
    name: "Rack Regional 01",
    site: "INPE — Cachoeira Paulista",
    location: "Datacenter Regional",
    group: "Fileira A",
    height: 24,
    width: 19,
    devices: [
      {
        id: "1007",
        name: "Servidor regional",
        role: "Servidor de aplicação",
        startingUnit: 18,
        height: 2,
        status: "Manutenção",
      },
    ],
  },
];

export function getOccupiedUnits(rack: RackSummary) {
  return rack.devices.reduce((total, device) => total + device.height, 0);
}
