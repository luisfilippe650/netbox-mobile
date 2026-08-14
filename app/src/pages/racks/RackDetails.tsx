import { PageShell } from "../../components/PageShell/PageShell";
import { getOccupiedUnits, type RackDevice, type RackSummary } from "./data";
import "./rack-details.css";

type RackDetailsProps = {
  rack: RackSummary;
  onBack: () => void;
};

function getDeviceAtUnit(devices: readonly RackDevice[], unit: number) {
  return devices.find(
    (device) =>
      unit >= device.startingUnit && unit < device.startingUnit + device.height,
  );
}

export default function RackDetails({ rack, onBack }: RackDetailsProps) {
  const occupiedUnits = getOccupiedUnits(rack);
  const freeUnits = rack.height - occupiedUnits;
  const units = Array.from(
    { length: rack.height },
    (_, index) => rack.height - index,
  );

  return (
    <PageShell
      className="rack-details-page"
      eyebrow={rack.id}
      title={rack.name}
      subtitle={`${rack.location} · ${rack.site}`}
    >
      <section className="rack-details__metrics" aria-label="Ocupação do rack">
        <article>
          <span>Altura</span>
          <strong>{rack.height}U</strong>
        </article>
        <article className="rack-details__metric--occupied">
          <span>Ocupado</span>
          <strong>{occupiedUnits}U</strong>
        </article>
        <article className="rack-details__metric--free">
          <span>Livre</span>
          <strong>{freeUnits}U</strong>
        </article>
      </section>

      <section className="rack-details__info">
        <div>
          <span>Função</span>
          <strong>{rack.role}</strong>
        </div>
        <div>
          <span>Grupo</span>
          <strong>{rack.group}</strong>
        </div>
        <div>
          <span>Largura</span>
          <strong>{rack.width} inches</strong>
        </div>
        <div>
          <span>Equipamentos</span>
          <strong>{rack.devices.length}</strong>
        </div>
      </section>

      <section className="rack-details__section">
        <div className="rack-details__heading">
          <div>
            <h2>Desenho do rack</h2>
            <p>Visão frontal e posição de cada equipamento.</p>
          </div>
          <div className="rack-details__legend">
            <span />
            <small>Ocupado</small>
          </div>
        </div>
        <div
          className="rack-elevation"
          aria-label={`Vista frontal do ${rack.name}`}
        >
          <div className="rack-elevation__top">
            <i />
            <strong>{rack.name}</strong>
            <i />
          </div>
          <div className="rack-elevation__body">
            {units.map((unit) => {
              const device = getDeviceAtUnit(rack.devices, unit);
              const isDeviceTop =
                device && unit === device.startingUnit + device.height - 1;
              return (
                <div
                  className={`rack-elevation__unit${device ? " rack-elevation__unit--occupied" : ""}`}
                  key={unit}
                >
                  <span>{unit}U</span>
                  <div title={device?.name}>
                    {isDeviceTop ? device.name : null}
                  </div>
                  <span>{unit}U</span>
                </div>
              );
            })}
          </div>
          <div className="rack-elevation__base">
            <i />
            <i />
          </div>
        </div>
      </section>

      <section className="rack-details__section">
        <div className="rack-details__heading">
          <div>
            <h2>Servidores alocados</h2>
            <p>{rack.devices.length} equipamentos instalados neste rack.</p>
          </div>
        </div>
        <div className="rack-devices">
          {rack.devices.map((device) => (
            <article className="rack-device" key={device.id}>
              <span className="rack-device__unit">U{device.startingUnit}</span>
              <div>
                <strong>{device.name}</strong>
                <p>
                  {device.role} · {device.height}U
                </p>
                <small>ID {device.id}</small>
              </div>
              <span
                className={`rack-device__status${device.status === "Manutenção" ? " rack-device__status--warning" : ""}`}
              >
                {device.status}
              </span>
            </article>
          ))}
        </div>
      </section>

      <button className="rack-details__back" type="button" onClick={onBack}>
        Voltar para os racks
      </button>
    </PageShell>
  );
}
