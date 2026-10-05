import { format, t } from "../../../i18n/language";
import { useEffect, useState } from "react";
import { PageShell } from "../../../components/PageShell/PageShell";
import {
  buildCablePayload,
  isTerminationAvailable,
  type CableFormValues,
  type CableOptions,
  type ConnectionTermination,
  type DeviceSummary,
  type NetBoxCable,
  type TerminationKind,
} from "../../../services";
import TerminationPicker from "../shared/TerminationPicker";
import "./AddConnection.css";
import "./AddConnectionSuccess.css";

type Props = {
  searchDevices: (query: string) => Promise<DeviceSummary[]>;
  loadTerminations: (deviceId: number) => Promise<ConnectionTermination[]>;
  loadMetadata: () => Promise<CableOptions>;
  revalidate: (
    kind: TerminationKind,
    id: number,
  ) => Promise<ConnectionTermination>;
  create: (
    payload: ReturnType<typeof buildCablePayload>,
  ) => Promise<NetBoxCable>;
  onCreated: (cable: NetBoxCable) => void;
  onBack: () => void;
};

function DeviceSearch({
  side,
  search,
  selected,
  onSelect,
  onClear,
}: {
  side: "A" | "B";
  search: Props["searchDevices"];
  selected: DeviceSummary | null;
  onSelect: (device: DeviceSummary) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DeviceSummary[]>([]);
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    let active = true;
    const timer = window.setTimeout(
      () =>
        void search(query.trim())
          .then((items) => {
            if (active) setResults(items);
          })
          .catch(() => {
            if (active) setResults([]);
          }),
      250,
    );
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, search]);
  const clear = () => {
    setQuery("");
    setResults([]);
    onClear();
  };
  return (
    <div className="add-connection__device-search">
      <label>{t("Buscar dispositivo ")}{t(side)}
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("Nome ou ID")}
        />
      </label>
      {selected ? (
        <div>
          <p>{t("Selecionado: ")}<strong>{selected.name}</strong>
          </p>
          <button type="button" onClick={clear}>{t("Alterar dispositivo ")}{t(side)}
          </button>
        </div>
      ) : (
        results.map((device) => (
          <button
            type="button"
            key={device.apiId}
            onClick={() => {
              onSelect(device);
              setResults([]);
            }}
          >
            {device.name}
          </button>
        ))
      )}
    </div>
  );
}

export default function AddConnection({
  searchDevices,
  loadTerminations,
  loadMetadata,
  revalidate,
  create,
  onCreated,
  onBack,
}: Props) {
  const [deviceA, setDeviceA] = useState<DeviceSummary | null>(null);
  const [deviceB, setDeviceB] = useState<DeviceSummary | null>(null);
  const [portsA, setPortsA] = useState<ConnectionTermination[]>([]);
  const [portsB, setPortsB] = useState<ConnectionTermination[]>([]);
  const [portA, setPortA] = useState<ConnectionTermination | null>(null);
  const [portB, setPortB] = useState<ConnectionTermination | null>(null);
  const [metadata, setMetadata] = useState<CableOptions | null>(null);
  const [values, setValues] = useState<CableFormValues>({
    status: "connected",
  });
  const [review, setReview] = useState(false);
  const [createdCable, setCreatedCable] = useState<NetBoxCable | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadMetadata()
      .then(setMetadata)
      .catch((failure: unknown) =>
        setError(
          failure instanceof Error
            ? failure.message
            : "Não foi possível carregar os campos do cabo.",
        ),
      );
  }, [loadMetadata]);

  const chooseDevice = (side: "A" | "B", device: DeviceSummary) => {
    if (side === "A") {
      setDeviceA(device);
      setPortA(null);
      setPortsA([]);
    } else {
      setDeviceB(device);
      setPortB(null);
      setPortsB([]);
    }
    setError("");
    void loadTerminations(device.apiId)
      .then((items) => (side === "A" ? setPortsA(items) : setPortsB(items)))
      .catch((failure: unknown) =>
        setError(
          failure instanceof Error
            ? failure.message
            : "Não foi possível carregar as portas.",
        ),
      );
  };

  const clearDevice = (side: "A" | "B") => {
    if (side === "A") {
      setDeviceA(null);
      setPortA(null);
      setPortsA([]);
    } else {
      setDeviceB(null);
      setPortB(null);
      setPortsB([]);
    }
    setReview(false);
    setError("");
  };

  const confirm = async () => {
    if (!portA || !portB) return;
    setBusy(true);
    setError("");
    try {
      const [freshA, freshB] = await Promise.all([
        revalidate(portA.kind, portA.id),
        revalidate(portB.kind, portB.id),
      ]);
      if (!isTerminationAvailable(freshA) || !isTerminationAvailable(freshB))
        throw new Error(
          "Uma das portas foi ocupada por outra operação. Escolha novamente.",
        );
      const cable = await create(buildCablePayload(freshA, freshB, values));
      setCreatedCable(cable);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Não foi possível criar a conexão.",
      );
    } finally {
      setBusy(false);
    }
  };

  const createNextSegment = () => {
    if (!deviceB || !portB) return;
    const mapped =
      portB.kind === "dcim.rearport"
        ? portsB.find(
            (item) =>
              item.kind === "dcim.frontport" &&
              portB.front_ports?.some(
                (mapping) => mapping.front_port === item.id,
              ),
          )
        : portB.kind === "dcim.frontport"
          ? portsB.find(
              (item) =>
                item.kind === "dcim.rearport" &&
                portB.rear_ports?.some(
                  (mapping) => mapping.rear_port === item.id,
                ),
            )
          : undefined;
    setDeviceA(deviceB);
    setPortsA(portsB);
    setPortA(mapped ?? null);
    setDeviceB(null);
    setPortsB([]);
    setPortB(null);
    setValues({ status: "connected" });
    setReview(false);
    setCreatedCable(null);
  };

  const startReview = () => {
    if (!portA || !portB) return;
    try {
      buildCablePayload(portA, portB, values);
      setError("");
      setReview(true);
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Revise os campos.",
      );
    }
  };

  const typeChoices = metadata?.actions.POST.type?.choices ?? [];
  return (
    <PageShell
      onBack={onBack}
      eyebrow={t("DCIM · Novo cabo")}
      title={t("Nova conexão")}
      subtitle={t("Cada confirmação cria um cabo físico no NetBox.")}
      className="add-connection-page"
    >
      {error ? (
        <p className="add-connection__error" role="alert">
          {t(error)}
        </p>
      ) : null}
      {createdCable ? (
        <section
          className="add-connection__card add-connection__success"
          role="status"
        >
          <span aria-hidden="true">✓</span>
          <h2>{t("Conexão criada")}</h2>
          <p>
            <strong>{createdCable.label || format("Cabo #{0}", [createdCable.id])}</strong>{" "}{t("já está registrado no NetBox.")}</p>
          <p>{t("Para atravessar um patch panel, continue pelo front/rear port associado e crie somente o próximo cabo.")}</p>
          <div className="add-connection__actions">
            <button type="button" onClick={() => onCreated(createdCable)}>{t("Voltar às conexões")}</button>
            <button type="button" onClick={createNextSegment}>{t("Criar próximo trecho")}</button>
          </div>
        </section>
      ) : !review ? (
        <>
          <section className="add-connection__card">
            <h2>{t("Extremidade A")}</h2>
            <DeviceSearch
              side="A"
              search={searchDevices}
              selected={deviceA}
              onSelect={(device) => chooseDevice("A", device)}
              onClear={() => clearDevice("A")}
            />
            {deviceA ? (
              <TerminationPicker
                items={portsA}
                selected={portA}
                onSelect={setPortA}
              />
            ) : null}
          </section>
          {portA ? (
            <section className="add-connection__card">
              <h2>{t("Extremidade B")}</h2>
              <DeviceSearch
                side="B"
                search={searchDevices}
                selected={deviceB}
                onSelect={(device) => chooseDevice("B", device)}
                onClear={() => clearDevice("B")}
              />
              {deviceB ? (
                <TerminationPicker
                  items={portsB}
                  selected={portB}
                  exclude={portA}
                  onSelect={setPortB}
                />
              ) : null}
            </section>
          ) : null}
          {portB ? (
            <section className="add-connection__card">
              <h2>{t("Dados do cabo")}</h2>
              <label>{t("Status")}<select
                  value={values.status}
                  onChange={(event) =>
                    setValues({
                      ...values,
                      status: event.target.value as CableFormValues["status"],
                    })
                  }
                >
                  <option value="connected">{t("Conectado")}</option>
                  <option value="planned">{t("Planejado")}</option>
                  <option value="decommissioning">{t("Em desativação")}</option>
                </select>
              </label>
              <label>{t("Tipo")}<select
                  value={values.type ?? ""}
                  onChange={(event) =>
                    setValues({ ...values, type: event.target.value })
                  }
                >
                  <option value="">{t("Não informado")}</option>
                  {typeChoices.map((choice) => (
                    <option key={choice.value} value={choice.value}>
                      {t(choice.display_name)}
                    </option>
                  ))}
                </select>
              </label>
              <label>{t("Etiqueta")}<input
                  maxLength={100}
                  value={values.label ?? ""}
                  onChange={(event) =>
                    setValues({ ...values, label: event.target.value })
                  }
                />
              </label>
              <label>{t("Cor")}<input
                  type="color"
                  value={`#${values.color?.replace("#", "") || "2196f3"}`}
                  onChange={(event) =>
                    setValues({ ...values, color: event.target.value })
                  }
                />
              </label>
              <div className="add-connection__row">
                <label>{t("Comprimento")}<input
                    type="number"
                    min="0"
                    step="0.01"
                    value={values.length ?? ""}
                    onChange={(event) =>
                      setValues({
                        ...values,
                        length: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      })
                    }
                  />
                </label>
                <label>{t("Unidade")}<select
                    value={values.lengthUnit ?? ""}
                    onChange={(event) =>
                      setValues({
                        ...values,
                        lengthUnit: (event.target.value ||
                          undefined) as CableFormValues["lengthUnit"],
                      })
                    }
                  >
                    <option value="">{t("Selecione")}</option>
                    {["km", "m", "cm", "mi", "ft", "in"].map((unit) => (
                      <option key={unit}>{t(unit)}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>{t("Descrição")}<textarea
                  maxLength={200}
                  value={values.description ?? ""}
                  onChange={(event) =>
                    setValues({ ...values, description: event.target.value })
                  }
                />
              </label>
              <button
                type="button"
                className="add-connection__primary"
                onClick={startReview}
              >{t("Revisar conexão")}</button>
            </section>
          ) : null}
        </>
      ) : (
        <section className="add-connection__card add-connection__summary">
          <h2>{t("Resumo")}</h2>
          <p>
            <strong>{t("A")}</strong> {deviceA?.name} · {portA?.name}
          </p>
          <p>
            <strong>{t("B")}</strong> {deviceB?.name} · {portB?.name}
          </p>
          <p>{t("Status: ")}{t(values.status)}</p>
          <p>{t("Tipo: ")}{t(values.type || "Não informado")}</p>
          <aside>{t("Se houver patch panel, crie cada trecho como um cabo separado. O mapping front ⇄ rear continuará formando o caminho.")}</aside>
          <div className="add-connection__actions">
            <button type="button" onClick={() => setReview(false)}>{t("Voltar e editar")}</button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void confirm()}
            >
              {t(busy ? "Criando…" : "Confirmar criação")}
            </button>
          </div>
        </section>
      )}
    </PageShell>
  );
}
