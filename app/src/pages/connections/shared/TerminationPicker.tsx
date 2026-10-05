import { t } from "../../../i18n/language";
import { useState } from "react";
import {
  areTerminationsCompatible,
  isTerminationAvailable,
  type ConnectionTermination,
} from "../../../services";

type Props = {
  items: readonly ConnectionTermination[];
  selected: ConnectionTermination | null;
  onSelect: (item: ConnectionTermination) => void;
  exclude?: ConnectionTermination | null;
};

const labels = {
  "dcim.interface": "Interfaces",
  "dcim.frontport": "Portas frontais",
  "dcim.rearport": "Portas traseiras",
} as const;

export default function TerminationPicker({
  items,
  selected,
  onSelect,
  exclude,
}: Props) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const available = items.filter(
    (item) =>
      isTerminationAvailable(item) &&
      (!exclude || areTerminationsCompatible(exclude, item)) &&
      (!normalizedQuery ||
        [item.name, item.label, item.type?.label]
          .filter(Boolean)
          .some((value) =>
            String(value).toLocaleLowerCase("pt-BR").includes(normalizedQuery),
          )),
  );
  return (
    <div className="termination-picker">
      <label>
        <span>{t("Pesquisar porta")}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("Nome, etiqueta ou tipo")}
        />
      </label>
      {(Object.keys(labels) as ConnectionTermination["kind"][]).map((kind) => {
        const group = available.filter((item) => item.kind === kind);
        if (!group.length) return null;
        return (
          <section key={kind}>
            <h3>{t(labels[kind])}</h3>
            {group.map((item) => (
              <button
                type="button"
                key={`${kind}-${item.id}`}
                aria-pressed={
                  selected?.kind === kind && selected.id === item.id
                }
                onClick={() => onSelect(item)}
              >
                <strong>{item.name}</strong>
                <small>
                  {item.type?.label ?? item.label ?? t("Porta física")}
                </small>
              </button>
            ))}
          </section>
        );
      })}
      {available.length === 0 ? (
        <p>{t("Nenhuma porta física disponível neste dispositivo.")}</p>
      ) : null}
    </div>
  );
}
