import { useState, type FormEvent } from "react";
import { PageShell } from "../../components/PageShell/PageShell";
import type { NetBoxRackGroup } from "../../services/netbox";
import type { OrganizationItem } from "../organization/OrganizationList";
import "./add-rack.css";

export type RackCreateInput = { siteId: number; locationId: number | null; groupId: number | null; name: string; description: string; width: number; startingUnit: number; height: number };
type AddRackProps = { sites: readonly OrganizationItem[]; locations: readonly OrganizationItem[]; groups: readonly NetBoxRackGroup[]; onBack: () => void; onCreate: (input: RackCreateInput) => Promise<void> };
const rackWidths = [10, 19, 21, 23] as const;

export default function AddRack({ sites, locations, groups, onBack, onCreate }: AddRackProps) {
  const [selectedSite, setSelectedSite] = useState(""); const [selectedLocation, setSelectedLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); const [error, setError] = useState("");
  const availableLocations = locations.filter((location) => String(location.siteId) === selectedSite);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget); setIsSubmitting(true); setError("");
    try { await onCreate({ siteId: Number(data.get("site")), locationId: selectedLocation ? Number(selectedLocation) : null,
      groupId: data.get("rackGroup") ? Number(data.get("rackGroup")) : null, name: String(data.get("name") ?? "").trim(),
      description: String(data.get("description") ?? "").trim(), width: Number(data.get("width")),
      startingUnit: Number(data.get("startingUnit")), height: Number(data.get("height")) }); }
    catch (createError) { setError(createError instanceof Error ? createError.message : "Não foi possível criar o rack."); }
    finally { setIsSubmitting(false); }
  };
  return <PageShell className="add-rack-page" eyebrow="Racks" title="Adicionar rack" subtitle="Preencha as informações do novo rack.">
    {error ? <p className="add-rack__error" role="alert">{error}</p> : null}
    <form className="add-rack__form" onSubmit={(event) => void submit(event)}>
      <section className="add-rack__section"><div className="add-rack__section-title"><h2>Localização</h2><p>Defina onde o rack será instalado.</p></div>
        <label className="add-rack__field"><span>Site <em>obrigatório</em></span><select name="site" required value={selectedSite} onChange={(event) => { setSelectedSite(event.target.value); setSelectedLocation(""); }}><option value="" disabled>Selecione um site</option>{sites.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}</select></label>
        <label className="add-rack__field"><span>Local</span><select name="location" value={selectedLocation} disabled={!selectedSite || availableLocations.length === 0} onChange={(event) => setSelectedLocation(event.target.value)}><option value="">{!selectedSite ? "Selecione o site primeiro" : availableLocations.length === 0 ? "Nenhum local neste site" : "Selecione um local"}</option>{availableLocations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}</select></label>
        <label className="add-rack__field"><span>Grupo de racks</span><select name="rackGroup" defaultValue=""><option value="">Sem grupo</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.name ?? group.display}</option>)}</select></label>
      </section>
      <section className="add-rack__section"><div className="add-rack__section-title"><h2>Dados do rack</h2><p>Informe a identificação e as dimensões.</p></div>
        <label className="add-rack__field"><span>Nome <em>obrigatório</em></span><input type="text" name="name" required placeholder="Ex.: Rack 01" /></label>
        <label className="add-rack__field"><span>Descrição</span><textarea name="description" rows={3} placeholder="Descrição do rack (opcional)" /></label>
        <label className="add-rack__field"><span>Largura <em>obrigatório</em></span><select name="width" required defaultValue="19">{rackWidths.map((width) => <option key={width} value={width}>{width} inches</option>)}</select></label>
        <div className="add-rack__field-group"><label className="add-rack__field"><span>Unidade inicial <em>obrigatório</em></span><input type="number" name="startingUnit" required min="1" step="1" defaultValue="1" /></label><label className="add-rack__field"><span>Altura (U) <em>obrigatório</em></span><input type="number" name="height" required min="1" step="1" defaultValue="42" /></label></div>
      </section>
      <button className="add-rack__save" type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando…" : "Salvar rack"}</button>
    </form><button className="add-rack__back" type="button" onClick={onBack}>Voltar</button>
  </PageShell>;
}
