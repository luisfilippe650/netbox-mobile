import { useState, type FormEvent } from "react";
import { PageShell } from "../../components/PageShell/PageShell";
import { useAccess } from "../../context/AccessContext";
import type { DeviceRoleColor, NetBoxDeviceRole, NetBoxDeviceType, NetBoxRack } from "../../services";
import type { OrganizationItem } from "../organization/OrganizationList";
import { defaultDeviceRoleColor, DeviceRoleColorPicker } from "./DeviceRoleColorPicker";
import "./add-device.css";

export type DeviceCreateInput = { name: string; roleId: number; deviceTypeId: number; siteId: number; locationId: number | null; rackId: number | null; position: number | null; description: string };

type AddDeviceProps = {
  onBack: () => void; sites: readonly OrganizationItem[]; locations: readonly OrganizationItem[];
  roles: readonly NetBoxDeviceRole[]; deviceTypes: readonly NetBoxDeviceType[]; racks: readonly NetBoxRack[];
  onCreate: (input: DeviceCreateInput) => Promise<void>; onCreateRole: (name: string, color: DeviceRoleColor) => Promise<void>;
  onCreateDeviceType: () => void;
};

export default function AddDevice({ onBack, sites, locations, roles, deviceTypes, racks, onCreate, onCreateRole, onCreateDeviceType }: AddDeviceProps) {
  const { can } = useAccess();
  const [showFunctionForm, setShowFunctionForm] = useState(false);
  const [newFunction, setNewFunction] = useState("");
  const [newFunctionColor, setNewFunctionColor] = useState<DeviceRoleColor>(defaultDeviceRoleColor);
  const [selectedSite, setSelectedSite] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const availableLocations = locations.filter((location) => String(location.siteId) === selectedSite);
  const availableRacks = racks.filter((rack) => rack.site.id === Number(selectedSite) && (!selectedLocation || rack.location?.id === Number(selectedLocation)));

  const createFunction = async () => {
    const name = newFunction.trim(); if (!name) return;
    setIsSubmitting(true); setError("");
    try { await onCreateRole(name, newFunctionColor); setNewFunction(""); setNewFunctionColor(defaultDeviceRoleColor); setShowFunctionForm(false); }
    catch (createError) { setError(createError instanceof Error ? createError.message : "Não foi possível criar a função."); }
    finally { setIsSubmitting(false); }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    setIsSubmitting(true); setError("");
    try {
      await onCreate({ name: String(data.get("deviceName") ?? "").trim(), roleId: Number(data.get("deviceFunction")),
        deviceTypeId: Number(data.get("deviceType")), siteId: Number(data.get("site")),
        locationId: selectedLocation ? Number(selectedLocation) : null, rackId: data.get("rack") ? Number(data.get("rack")) : null,
        position: data.get("position") ? Number(data.get("position")) : null, description: String(data.get("description") ?? "").trim() });
    } catch (createError) { setError(createError instanceof Error ? createError.message : "Não foi possível criar o dispositivo."); }
    finally { setIsSubmitting(false); }
  };

  return <PageShell className="add-device-page" eyebrow="Dispositivos" title="Adicionar dispositivo" subtitle="Preencha as informações do novo equipamento.">
    {error ? <p className="add-device__error" role="alert">{error}</p> : null}
    <form className="add-device__form" onSubmit={(event) => void submit(event)}>
      <section className="add-device__section">
        <div className="add-device__section-title"><div><h2>Dados do dispositivo</h2><p>Informe os dados principais do equipamento.</p></div></div>
        <label className="add-device__field"><span>Nome do dispositivo</span><input type="text" name="deviceName" placeholder="Ex.: Servidor principal" /></label>
        <div className="add-device__field-group"><label className="add-device__field"><span>Função do dispositivo <em>obrigatório</em></span>
          <select name="deviceFunction" required defaultValue=""><option value="" disabled>Selecione uma função</option>{roles.map((item) => <option key={item.id} value={item.id}>{item.name ?? item.display}</option>)}</select></label>
          {can("dcim.devicerole", "add") ? <button className="add-device__create-related" type="button" onClick={() => setShowFunctionForm((current) => !current)}>+ Criar função</button> : null}</div>
        {showFunctionForm ? <div className="add-device__new-function"><label className="add-device__field"><span>Nova função</span><input autoFocus value={newFunction} onChange={(event) => setNewFunction(event.target.value)} placeholder="Ex.: Firewall" /></label><DeviceRoleColorPicker value={newFunctionColor} onChange={setNewFunctionColor} disabled={isSubmitting} /><button type="button" disabled={isSubmitting} onClick={() => void createFunction()}>Adicionar função</button></div> : null}
        <label className="add-device__field"><span>Descrição</span><textarea name="description" rows={3} placeholder="Descreva o dispositivo (opcional)" /></label>
        <div className="add-device__field-group"><label className="add-device__field"><span>Tipo de dispositivo <em>obrigatório</em></span><select name="deviceType" required defaultValue=""><option value="" disabled>Selecione um tipo</option>{deviceTypes.map((item) => <option key={item.id} value={item.id}>{item.model}</option>)}</select></label>
          {can("dcim.devicetype", "add") ? <button className="add-device__create-related" type="button" onClick={onCreateDeviceType}>+ Criar tipo de dispositivo</button> : null}</div>
      </section>
      <section className="add-device__section">
        <div className="add-device__section-title"><div><h2>Localização</h2><p>Vincule o dispositivo ao local físico.</p></div></div>
        <label className="add-device__field"><span>Site <em>obrigatório</em></span><select name="site" required value={selectedSite} onChange={(event) => { setSelectedSite(event.target.value); setSelectedLocation(""); }}><option value="" disabled>Selecione um site</option>{sites.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}</select></label>
        <div className="add-device__field-group add-device__field-group--two">
          <label className="add-device__field"><span>Local</span><select name="location" value={selectedLocation} disabled={!selectedSite || availableLocations.length === 0} onChange={(event) => setSelectedLocation(event.target.value)}><option value="">{!selectedSite ? "Selecione o site primeiro" : availableLocations.length === 0 ? "Nenhum local neste site" : "Selecione um local"}</option>{availableLocations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}</select></label>
          <label className="add-device__field"><span>Rack</span><select name="rack" defaultValue=""><option value="">Sem rack</option>{availableRacks.map((rack) => <option key={rack.id} value={rack.id}>{rack.name}</option>)}</select></label>
        </div>
        <label className="add-device__field"><span>Posição (U)</span><input type="number" min="0.5" max="999.5" step="0.5" name="position" placeholder="Ex.: 12,5" /></label>
      </section>
      <button className="add-device__save" type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando…" : "Salvar dispositivo"}</button>
    </form>
    <button className="page-button page-button--secondary add-device__back" type="button" onClick={onBack}>Voltar</button>
  </PageShell>;
}
