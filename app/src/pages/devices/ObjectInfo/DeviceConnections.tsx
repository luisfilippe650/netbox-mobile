import { format, t } from "../../../i18n/language";
import { useEffect, useState } from "react";
import {
  isTerminationAvailable,
  type ConnectionTermination,
} from "../../../services";

type Props = {
  deviceId: number;
  load: (deviceId: number) => Promise<ConnectionTermination[]>;
  onOpenCable: (id: number) => void;
  onOpenDevice: (id: number) => void;
};

function remoteEndpoint(item: ConnectionTermination) {
  const value = item.connected_endpoints?.[0] ?? item.link_peers[0];
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const device = record.device;
  if (!device || typeof device !== "object") return null;
  const nested = device as Record<string, unknown>;
  return typeof nested.id === "number" ? { id: nested.id, label: String(nested.name ?? nested.display ?? `Dispositivo #${nested.id}`), port: String(record.name ?? record.display ?? "Porta") } : null;
}

function cableId(item: ConnectionTermination) {
  return typeof item.cable === "number" ? item.cable : item.cable?.id;
}

export default function DeviceConnections({ deviceId, load, onOpenCable, onOpenDevice }: Props) {
  const [items, setItems] = useState<ConnectionTermination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; setLoading(true); setError(""); void load(deviceId).then((result) => { if (active) setItems(result); }).catch((failure: unknown) => { if (active) setError(failure instanceof Error ? failure.message : "Não foi possível carregar as conexões."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [deviceId, load]);

  return <section className="object-info__card device-connections"><div className="object-info__section-title"><h2>{t("Conexões")}</h2><p>{t("Interfaces e portas físicas deste equipamento.")}</p></div>
    {loading ? <p role="status">{t("Carregando conexões…")}</p> : error ? <p className="object-info__error" role="alert">{t(error)}</p> : items.length === 0 ? <p>{t("Nenhuma interface ou porta foi cadastrada.")}</p> : <div className="device-connections__list">{items.map((item) => {
      const id = cableId(item); const remote = remoteEndpoint(item); const status = id ? "Conectada" : isTerminationAvailable(item) ? "Disponível" : "Indisponível";
      return <article key={`${item.kind}-${item.id}`} className={`device-connections__item device-connections__item--${status.toLocaleLowerCase("pt-BR")}`}><div><strong>{item.name}</strong><small>{t(item.kind === "dcim.interface" ? "Interface" : item.kind === "dcim.frontport" ? "Porta frontal" : "Porta traseira")}</small></div><span>{t(status)}</span>{id ? <button type="button" onClick={() => onOpenCable(id)}>{t("Abrir conexão ")}{typeof item.cable === "object" && item.cable?.display ? item.cable.display : format("Cabo #{0}", [id])}</button> : null}{remote ? <button type="button" onClick={() => onOpenDevice(remote.id)}>{remote.label} · {remote.port}</button> : id ? <small>{t("Caminho incompleto ou destino indisponível")}</small> : null}</article>;
    })}</div>}
  </section>;
}
