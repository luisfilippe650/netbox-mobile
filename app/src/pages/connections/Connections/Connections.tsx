import { format, t } from "../../../i18n/language";
import { useState } from "react";
import { PageShell } from "../../../components/PageShell/PageShell";
import { Pagination } from "../../../components/Pagination/Pagination";
import {
  usePaginatedData,
  type PageRequest,
  type PageResult,
} from "../../../hooks/usePaginatedData";
import type { NetBoxCable } from "../../../services";
import "./Connections.css";

type Props = {
  loadPage: (request: PageRequest) => Promise<PageResult<NetBoxCable>>;
  onSelect: (cable: NetBoxCable) => void;
  onBack: () => void;
};

const choiceLabel = (choice: NetBoxCable["type"]) =>
  choice && typeof choice === "object"
    ? choice.label
    : choice || "Tipo não informado";

const statusLabels = {
  connected: "Conectado",
  planned: "Planejado",
  decommissioning: "Em desativação",
};

const terminationLabels = {
  "dcim.interface": "Interface",
  "dcim.frontport": "Porta frontal",
  "dcim.rearport": "Porta traseira",
};

function ConnectionSide({ items, side }: {
  items: NetBoxCable["a_terminations"];
  side: "A" | "B";
}) {
  return (
    <span className="connections__endpoint">
      <span className="connections__endpoint-marker" aria-label={format("Ponta {0}", [side])}>{t(side)}</span>
      <span className="connections__endpoint-content">
        {items.length === 0 ? <strong>{t("Sem terminação")}</strong> : items.map(item => (
          <span className="connections__termination" key={`${item.object_type}-${item.object_id}`}>
            <strong>{item.object?.device.name || item.object?.device.display || t("Equipamento não informado")}</strong>
            <small>{item.object?.name || item.object?.display || `${terminationLabels[item.object_type]} #${item.object_id}`}</small>
          </span>
        ))}
      </span>
    </span>
  );
}

export default function Connections({
  loadPage,
  onSelect,
  onBack,
}: Props) {
  const [query, setQuery] = useState("");
  const { error, isLoading, items, page, pageSize, setPage, total } =
    usePaginatedData({ loadPage, query });

  return (
    <PageShell
      onBack={onBack}
      eyebrow={t("DCIM · Cabos")}
      title={t("Conexões")}
      subtitle={t("Consulte os cabos e os caminhos físicos registrados no NetBox.")}
      className="connections-page"
    >
      <section className="connections__toolbar">
        <label>
          <span>{t("Pesquisar conexão")}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("Etiqueta, dispositivo ou porta")}
          />
        </label>
      </section>
      {isLoading ? (
        <p className="connections__state" role="status">{t("Carregando conexões…")}</p>
      ) : error ? (
        <p
          className="connections__state connections__state--error"
          role="alert"
        >
          {t(error)}
        </p>
      ) : items.length === 0 ? (
        <p className="connections__state">{t("Nenhuma conexão encontrada.")}</p>
      ) : (
        <section className="connections__list" aria-label={t("Conexões físicas")}>
          {items.map((cable) => {
            const name = cable.label || format("Cabo #{0}", [cable.id]);
            return (
              <button
                key={cable.id}
                type="button"
                className={`connections__card connections__card--${cable.status.value}`}
                aria-label={format("Abrir conexão {0}", [name])}
                onClick={() => onSelect(cable)}
              >
                <span className="connections__card-head">
                  <strong>{t(name)}</strong>
                  <small className="connections__status">{t(statusLabels[cable.status.value])}</small>
                </span>
                <span className="connections__route">
                  <ConnectionSide items={cable.a_terminations} side="A" />
                  <ConnectionSide items={cable.b_terminations} side="B" />
                </span>
                <span className="connections__card-footer">
                  <small>
                    {t(choiceLabel(cable.type))}
                    {t(cable.length !== null
                      ? ` · ${cable.length} ${cable.length_unit?.value ?? ""}`
                      : "")}
                  </small>
                  <span className="connections__details">{t("Ver detalhes ")}<span aria-hidden="true">→</span></span>
                </span>
              </button>
            );
          })}
        </section>
      )}
      <Pagination
        disabled={isLoading}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
      />
    </PageShell>
  );
}
