import { format, t } from "../../../i18n/language";
import type { ConnectionDiagramNode } from "../../../services";

type Props = {
  nodes: readonly ConnectionDiagramNode[];
  onOpenDevice: (id: number) => void;
};

function NodeIcon({ kind }: { kind: ConnectionDiagramNode["kind"] }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {kind === "device" ? (
        <>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </>
      ) : kind === "termination" ? (
        <>
          <rect x="4" y="7" width="16" height="10" rx="2" />
          <path d="M8 7V4M12 7V4M16 7V4M8 17v3M12 17v3M16 17v3" />
        </>
      ) : kind === "cable" ? (
        <>
          <path d="M8.5 8.5 6.8 6.8a3 3 0 0 0-4.2 4.2l2.8 2.8a3 3 0 0 0 4.2 0l1.1-1.1" />
          <path d="m15.5 15.5 1.7 1.7a3 3 0 0 0 4.2-4.2l-2.8-2.8a3 3 0 0 0-4.2 0l-1.1 1.1M8.5 15.5l7-7" />
        </>
      ) : kind === "pass-through" ? (
        <>
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="M7 12h10M14 9l3 3-3 3M10 9l-3 3 3 3" />
        </>
      ) : (
        <>
          <path d="M12 3 2.8 20h18.4L12 3Z" />
          <path d="M12 9v5M12 17v.2" />
        </>
      )}
    </svg>
  );
}

export default function ConnectionDiagram({
  nodes,
  onOpenDevice,
}: Props) {
  return (
    <div className="connection-diagram" aria-label={t("Caminho físico")}>
      {nodes.map((node, index) => (
        <div
          className={`connection-diagram__node connection-diagram__node--${node.kind}`}
          key={`${node.kind}-${index}`}
        >
          <span className="connection-diagram__marker">
            <NodeIcon kind={node.kind} />
          </span>
          {node.kind === "device" ? (
            <button type="button" onClick={() => onOpenDevice(node.deviceId)}>
              <small className="connection-diagram__type">{t("Equipamento")}</small>
              <strong>{node.label}</strong>
              <small>{t("Toque para visualizar os detalhes")}</small>
            </button>
          ) : null}
          {node.kind === "termination" ? (
            <div>
              <small className="connection-diagram__type">
                {t(node.termination.kind === "dcim.interface"
                  ? t("Interface")
                  : node.termination.kind === "dcim.frontport"
                    ? t("Porta frontal")
                    : t("Porta traseira"))}
              </small>
              <strong>{node.termination.name}</strong>
              {node.termination.label ? (
                <small>{node.termination.label}</small>
              ) : null}
            </div>
          ) : null}
          {node.kind === "cable" ? (
            <div className="connection-diagram__cable">
              <small className="connection-diagram__type">{t("Cabo físico")}</small>
              <strong>{node.cable.label || format("Cabo #{0}", [node.cable.id])}</strong>
              <small>{t(node.cable.status.label)}</small>
            </div>
          ) : null}
          {node.kind === "pass-through" ? (
            <button type="button" onClick={() => onOpenDevice(node.deviceId)}>
              <small className="connection-diagram__type">{t("Patch panel")}</small>
              <strong>{node.label}</strong>
              <span>
                {node.rear.name} ⇄ {node.front.name}
              </span>
              <small>{t("Passagem interna entre portas")}</small>
            </button>
          ) : null}
          {node.kind === "notice" ? (
            <p role={node.tone === "warning" ? "alert" : undefined}>
              {t(node.label)}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
