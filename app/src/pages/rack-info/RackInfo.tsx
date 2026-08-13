import { PageShell } from "../../components/PageShell/PageShell";
import rackIcon from "../../assets/icons/rack_medio.png";
import { getOccupiedUnits, type RackSummary } from "../racks/data";
import "./rack-info.css";

type RackInfoProps = {
  onBack: () => void;
  onSelect: (rack: RackSummary) => void;
  items: readonly RackSummary[];
};

export default function RackInfo({ onBack, onSelect, items }: RackInfoProps) {
  return (
    <PageShell
      className="rack-list-page"
      eyebrow="Racks"
      title="Visualizar racks"
      subtitle="Selecione um rack para consultar sua ocupação e os equipamentos alocados."
    >
      <section className="rack-list__heading">
        <div>
          <h2>Racks cadastrados</h2>
          <p>{items.length} racks encontrados</p>
        </div>
      </section>

      <div className="rack-list">
        {items.map((rack) => {
          const occupiedUnits = getOccupiedUnits(rack);
          return (
            <button
              className="rack-list__card"
              type="button"
              key={rack.id}
              onClick={() => onSelect(rack)}
            >
              <span className="rack-list__icon">
                <img src={rackIcon} alt="" />
              </span>
              <span className="rack-list__content">
                <span className="rack-list__title">
                  <strong>{rack.name}</strong>
                  <small>{rack.id}</small>
                </span>
                <span className="rack-list__location">
                  {rack.location} · {rack.site}
                </span>
                <span className="rack-list__usage">
                  <span>
                    <i
                      style={{
                        width: `${(occupiedUnits / rack.height) * 100}%`,
                      }}
                    />
                  </span>
                  <small>
                    {occupiedUnits}U ocupadas de {rack.height}U
                  </small>
                </span>
              </span>
              <span className="rack-list__arrow" aria-hidden="true">
                ›
              </span>
            </button>
          );
        })}
      </div>
      {items.length === 0 ? <p className="rack-list__empty">Nenhum rack cadastrado no NetBox.</p> : null}

      <button className="rack-list__back" type="button" onClick={onBack}>
        Voltar
      </button>
    </PageShell>
  );
}
