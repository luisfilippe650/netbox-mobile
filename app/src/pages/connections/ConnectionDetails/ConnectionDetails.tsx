import { format, t } from "../../../i18n/language";
import { useEffect, useState } from "react";
import { PageShell } from "../../../components/PageShell/PageShell";
import {
  directCableDiagram,
  normalizeCablePath,
  normalizeTrace,
  type CablePathSource,
  type ConnectionDiagramNode,
  type NetBoxCable,
} from "../../../services";
import ConnectionDiagram from "../shared/ConnectionDiagram";
import "./ConnectionDetails.css";

type Props = {
  cable: NetBoxCable;
  loadPath: (cable: NetBoxCable) => Promise<CablePathSource>;
  onOpenDevice: (id: number) => void;
  onBack: () => void;
};

export default function ConnectionDetails({
  cable,
  loadPath,
  onOpenDevice,
  onBack,
}: Props) {
  const [nodes, setNodes] = useState<ConnectionDiagramNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void loadPath(cable)
      .then((source) => {
        if (!active) return;
        if (source.kind === "trace") setNodes(normalizeTrace(source.trace));
        else {
          const pathNodes =
            source.kind === "paths"
              ? normalizeCablePath(source.path)
              : directCableDiagram(cable);
          if (
            source.kind === "paths" &&
            (!source.path.is_complete || source.path.is_split)
          )
            pathNodes.push({
              kind: "notice",
              tone: "warning",
              label: source.path.is_split
                ? "O caminho possui uma divisão."
                : "O caminho está incompleto.",
            });
          setNodes(pathNodes);
        }
      })
      .catch((failure: unknown) => {
        if (active)
          setError(
            failure instanceof Error
              ? failure.message
              : "Não foi possível carregar o caminho.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [cable, loadPath]);

  return (
    <PageShell
      onBack={onBack}
      eyebrow={format("Cabo · ID {0}", [cable.id])}
      title={cable.label || format("Cabo #{0}", [cable.id])}
      subtitle={t("Caminho físico calculado pelo NetBox.")}
      className="connection-details-page"
    >
      <section
        className="connection-details__summary"
        aria-label={t("Resumo do cabo")}
      >
        <header className="connection-details__summary-head">
          <span className="connection-details__summary-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M7 7h4v4H7zM13 13h4v4h-4zM11 9h2v6h-2z" />
            </svg>
          </span>
          <div>
            <small>{t("Identificação")}</small>
            <strong>{cable.label || format("Cabo #{0}", [cable.id])}</strong>
          </div>
          <span
            className="connection-details__status"
            data-status={cable.status.value}
          >
            <i aria-hidden="true" />
            {cable.status.label}
          </span>
        </header>
        <dl className="connection-details__meta">
          <div>
            <dt>{t("ID no NetBox")}</dt>
            <dd>#{t(cable.id)}</dd>
          </div>
          <div>
            <dt>{t("Tipo")}</dt>
            <dd>
              {typeof cable.type === "object" && cable.type
                ? cable.type.label
                : cable.type || t("Não informado")}
            </dd>
          </div>
          <div>
            <dt>{t("Comprimento")}</dt>
            <dd>
              {cable.length === null
                ? t("Não informado")
                : `${cable.length} ${cable.length_unit?.label ?? ""}`}
            </dd>
          </div>
        </dl>
        {cable.description ? (
          <p className="connection-details__description">
            {cable.description}
          </p>
        ) : null}
      </section>

      <section
        className="connection-details__path"
        aria-labelledby="connection-path-title"
      >
        <header className="connection-details__path-head">
          <div>
            <h2 id="connection-path-title">{t("Caminho da conexão")}</h2>
            <p>{t("Ordem física registrada no NetBox.")}</p>
          </div>
          {!loading && !error ? (
            <span>
              {t(nodes.length)} {t(nodes.length === 1 ? "etapa" : "etapas")}
            </span>
          ) : null}
        </header>
        {error ? (
          <p className="connection-details__error" role="alert">
            {t(error)}
          </p>
        ) : loading ? (
          <div className="connection-details__loading" role="status">
            <span aria-hidden="true" />
            <div>
              <strong>{t("Carregando caminho")}</strong>
              <small>{t("Consultando as terminações no NetBox…")}</small>
            </div>
          </div>
        ) : (
          <ConnectionDiagram nodes={nodes} onOpenDevice={onOpenDevice} />
        )}
      </section>
    </PageShell>
  );
}
