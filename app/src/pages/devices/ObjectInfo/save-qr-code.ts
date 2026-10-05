import { Capacitor, registerPlugin } from "@capacitor/core";

const qrCodeDownload = registerPlugin<{
  save(options: { dataUrl: string; filename: string }): Promise<{ saved: boolean }>;
}>("QrCodeDownload");

export async function saveQrCode(dataUrl: string, deviceId: string) {
  const filename = `equipamento-${deviceId}-qr-code.png`;
  if (Capacitor.getPlatform() === "android") {
    return (await qrCodeDownload.save({ dataUrl, filename })).saved;
  }
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  return true;
}
