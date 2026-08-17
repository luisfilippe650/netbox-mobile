import { PageShell } from "../../../components/PageShell/PageShell";
import {
  getOccupiedUnits,
  getPositionedRackDevices,
  type RackSummary,
} from "../shared/data";
import "./RackDetails.css";

type RackDetailsProps = {
  rack: RackSummary;
  onBack: () => void;
};

export default function RackDetails({ rack, onBack }: RackDetailsProps) {
  const occupiedUnits = getOccupiedUnits(rack);
  const freeUnits = Math.max(0, rack.height - occupiedUnits);
  const highestUnit = rack.startingUnit + rack.height - 1;
  const units = Array.from(
    { length: rack.height },
    (_, index) => highestUnit - index,
  );
  const positionedDevices = getPositionedRackDevices(rack);

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
          <div
            className="rack-elevation__body"
            style={{ gridTemplateRows: `repeat(${rack.height}, 18px)` }}
          >
            {units.map((unit, index) => (
              <div className="rack-elevation__unit" key={unit}>
                <span style={{ gridRow: index + 1 }}>{unit}U</span>
                <div style={{ gridRow: index + 1 }} />
                <span style={{ gridRow: index + 1 }}>{unit}U</span>
              </div>
            ))}
            {positionedDevices.map((device) => (
              <div
                className="rack-elevation__device"
                key={device.id}
                style={{
                  gridRow: `${device.row} / span ${device.visibleHeight}`,
                }}
                title={`${device.name}: ${device.height}U, da U${device.startingUnit} até a U${device.startingUnit + device.height - 1}`}
              >
                <strong>{device.name}</strong>
                <small>
                  {device.height}U · U{device.startingUnit}–U
                  {device.startingUnit + device.height - 1}
                </small>
              </div>
            ))}
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
