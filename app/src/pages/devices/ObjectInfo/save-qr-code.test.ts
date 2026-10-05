// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { saveQrCode } from "./save-qr-code";

const native = vi.hoisted(() => ({ platform: "android", save: vi.fn() }));
vi.mock("@capacitor/core", () => ({
  Capacitor: { getPlatform: () => native.platform },
  registerPlugin: () => ({ save: native.save }),
}));
afterEach(() => { vi.restoreAllMocks(); native.save.mockReset(); native.platform = "android"; });

it("envia o PNG ao salvamento nativo do Android", async () => {
  native.save.mockResolvedValue({ saved: true });
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click");
  expect(await saveQrCode("data:image/png;base64,aGVsbG8=", "10")).toBe(true);
  expect(native.save).toHaveBeenCalledWith({ dataUrl: "data:image/png;base64,aGVsbG8=", filename: "equipamento-10-qr-code.png" });
  expect(click).not.toHaveBeenCalled();
});

it("não informa sucesso quando o usuário cancela", async () => {
  native.save.mockResolvedValue({ saved: false });
  expect(await saveQrCode("data:image/png;base64,aGVsbG8=", "10")).toBe(false);
});

it("propaga a falha de gravação para a tela", async () => {
  native.save.mockRejectedValue(new Error("Sem espaço"));
  await expect(saveQrCode("data:image/png;base64,aGVsbG8=", "10")).rejects.toThrow("Sem espaço");
});

it("mantém o download de PNG no navegador", async () => {
  native.platform = "web";
  let filename = "";
  let href = "";
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
    filename = this.download;
    href = this.href;
  });
  await saveQrCode("data:image/png;base64,aGVsbG8=", "10");
  expect(filename).toBe("equipamento-10-qr-code.png");
  expect(href).toBe("data:image/png;base64,aGVsbG8=");
  expect(native.save).not.toHaveBeenCalled();
});
