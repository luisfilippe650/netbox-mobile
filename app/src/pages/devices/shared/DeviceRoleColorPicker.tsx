import { t } from "../../../i18n/language";
import { deviceRoleColors, type DeviceRoleColor } from "../../../services";
import "./DeviceRoleColorPicker.css";

type DeviceRoleColorPickerProps = {
  value: DeviceRoleColor;
  onChange: (color: DeviceRoleColor) => void;
  disabled?: boolean;
};

export const defaultDeviceRoleColor: DeviceRoleColor = "9e9e9e";

export function DeviceRoleColorPicker({
  value,
  onChange,
  disabled = false,
}: DeviceRoleColorPickerProps) {
  const selectedColor = deviceRoleColors.find((color) => color.value === value);

  return (
    <fieldset className="device-role-colors" disabled={disabled}>
      <legend>{t("Cor da função")}</legend>
      <p>{t("Escolha a cor usada para identificar esta função no NetBox.")}</p>
      <div className="device-role-colors__grid">
        {deviceRoleColors.map((color) => (
          <label className="device-role-colors__option" key={color.value}>
            <input
              type="radio"
              name="deviceRoleColor"
              value={color.value}
              checked={value === color.value}
              onChange={() => onChange(color.value)}
            />
            <span
              className="device-role-colors__swatch"
              style={{ backgroundColor: `#${color.value}` }}
              aria-hidden="true"
            />
            <span>{color.label}</span>
          </label>
        ))}
      </div>
      <output className="device-role-colors__selected">{t("Selecionada: ")}<strong>{selectedColor?.label}</strong>{" "}
        <span>#{t(value)}</span>
      </output>
    </fieldset>
  );
}
