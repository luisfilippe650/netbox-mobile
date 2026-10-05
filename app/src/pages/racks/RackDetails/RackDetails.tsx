import { displayFallback, format, t } from "../../../i18n/language";
import { PageShell } from "../../../components/PageShell/PageShell";
import { useState } from "react";
import type { DeviceSummary } from "../../../services/view_models";
import {
  getOccupiedUnits,
  getPositionedRackDevices,
  type RackSummary,
} from "../shared/data";
import "./RackDetails.css";

type RackDetailsProps = {
  rack: RackSummary;
  onBack: () => void;
  onSelectDevice: (device: DeviceSummary) => void;
};

export default function RackDetails({
  rack,
  onBack,
  onSelectDevice,
}: RackDetailsProps) {
  const [face, setFace] = useState<"front" | "rear">(() =>
    getPositionedRackDevices(rack).length === 0 &&
    getPositionedRackDevices(rack, "rear").length > 0
      ? "rear"
      : "front",
  );
  const occupiedUnits = getOccupiedUnits(rack);
  const freeUnits = Math.max(0, rack.height - occupiedUnits);
  const highestUnit = rack.startingUnit + rack.height - 1;
  const units = Array.from(
    { length: rack.height },
    (_, index) => highestUnit - index,
  );
  const hasRearDevices = rack.devices.some(
    (device) => device.face === "rear" && !device.fullDepth,
  );
  const positionedDevices = getPositionedRackDevices(rack, face);

  return (
    <PageShell
      onBack={onBack}
      className="rack-details-page"
      title={rack.name}
      subtitle={format("{0} · {1}", [displayFallback(rack.location, "Sem local"), rack.site])}
    >
      <section className="rack-details__metrics" aria-label={t("Ocupação do rack")}>
        <article>
          <span>{t("Altura")}</span>
          <strong>{rack.height}{t("U")}</strong>
        </article>
        <article className="rack-details__metric--occupied">
          <span>{t("Ocupado")}</span>
          <strong>{t(occupiedUnits)}{t("U")}</strong>
        </article>
        <article className="rack-details__metric--free">
          <span>{t("Livre")}</span>
          <strong>{t(freeUnits)}{t("U")}</strong>
        </article>
      </section>

      <section className="rack-details__info">
        <div>
          <span>{t("Função")}</span>
          <strong>{displayFallback(rack.role, "Sem função")}</strong>
        </div>
        <div>
          <span>{t("Grupo")}</span>
          <strong>{displayFallback(rack.group, "Sem grupo")}</strong>
        </div>
        <div>
          <span>{t("Largura")}</span>
          <strong>{rack.width}{t(" inches")}</strong>
        </div>
        <div>
          <span>{t("Equipamentos")}</span>
          <strong>{rack.devices.length}</strong>
        </div>
      </section>

      <section className="rack-details__section">
        <div className="rack-details__heading">
          <div>
            <h2>{t("Desenho do rack")}</h2>
            <p>{t("Deslize para ver as unidades e toque em um equipamento.")}</p>
          </div>
          <div className="rack-details__legend">
            <span />
            <small>{t("Ocupado")}</small>
          </div>
        </div>
        {hasRearDevices ? (
          <div
            className="rack-details__face-switch"
            role="group"
            aria-label={t("Face do rack")}
          >
            <button
              type="button"
              aria-pressed={face === "front"}
              onClick={() => setFace("front")}
            >{t("Frente")}</button>
            <button
              type="button"
              aria-pressed={face === "rear"}
              onClick={() => setFace("rear")}
            >{t("Traseira")}</button>
          </div>
        ) : null}
        <div
          className="rack-elevation"
          aria-label={format("Vista {0} do {1}", [face === "front" ? t("frontal") : t("traseira"), rack.name])}
        >
          <div className="rack-elevation__top">
            <i />
            <strong>{rack.name}</strong>
            <i />
          </div>
          <div
            className="rack-elevation__body"
            style={{ gridTemplateRows: `repeat(${rack.height}, 48px)` }}
          >
            {units.map((unit, index) => (
              <div className="rack-elevation__unit" key={unit}>
                <span style={{ gridRow: index + 1 }}>{t(unit)}{t("U")}</span>
                <div style={{ gridRow: index + 1 }} />
                <span style={{ gridRow: index + 1 }}>{t(unit)}{t("U")}</span>
              </div>
            ))}
            {positionedDevices.map((device) => (
              <button
                className="rack-elevation__device"
                key={device.id}
                type="button"
                disabled={!device.summary}
                aria-label={format("{0} {1}, da U{2} até a U{3}", [device.summary ? t("Abrir") : t("Indisponível"), device.name, device.startingUnit, device.startingUnit + device.height - 1])}
                onClick={() => device.summary && onSelectDevice(device.summary)}
                style={{
                  gridRow: `${device.row} / span ${device.visibleHeight}`,
                }}
              >
                <strong>{device.name}</strong>
                {device.visibleHeight > 1 ? (
                  <small>
                    {device.height}{t("U · U")}{device.startingUnit}{t("–U")}{device.startingUnit + device.height - 1}
                  </small>
                ) : null}
              </button>
            ))}
          </div>
          <div className="rack-elevation__base">
            <i />
            <i />
          </div>
        </div>
      </section>

      <button className="rack-details__back" type="button" onClick={onBack}>{t("Voltar para os racks")}</button>
    </PageShell>
  );
}
