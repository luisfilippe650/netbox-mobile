package br.gov.inpe.netboxmobile;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.util.Base64;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.OutputStream;

@CapacitorPlugin(name = "QrCodeDownload")
public class QrCodeDownloadPlugin extends Plugin {
    private static final String PNG_PREFIX = "data:image/png;base64,";

    @PluginMethod
    public void save(PluginCall call) {
        String dataUrl = call.getString("dataUrl", "");
        String filename = call.getString("filename", "");
        if (!dataUrl.startsWith(PNG_PREFIX) || dataUrl.length() > 2_000_000 ||
            !filename.matches("equipamento-[0-9]+-qr-code\\.png")) {
            call.reject("QR Code inválido.");
            return;
        }
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("image/png");
        intent.putExtra(Intent.EXTRA_TITLE, filename);
        try {
            startActivityForResult(call, intent, "saveResult");
        } catch (Exception error) {
            call.reject("Não foi possível abrir a tela de salvamento.", error);
        }
    }

    @ActivityCallback
    private void saveResult(PluginCall call, ActivityResult activityResult) {
        if (call == null) return;
        JSObject result = new JSObject();
        if (activityResult.getResultCode() != Activity.RESULT_OK) {
            result.put("saved", false);
            call.resolve(result);
            return;
        }
        Intent data = activityResult.getData();
        Uri uri = data == null ? null : data.getData();
        if (uri == null) {
            call.reject("O Android não informou o destino do arquivo.");
            return;
        }
        try (OutputStream output = getContext().getContentResolver().openOutputStream(uri, "wt")) {
            if (output == null) throw new java.io.IOException("Destino indisponível");
            byte[] png = Base64.decode(call.getString("dataUrl", "").substring(PNG_PREFIX.length()), Base64.DEFAULT);
            output.write(png);
        } catch (Exception error) {
            call.reject("Não foi possível salvar o QR Code. Verifique o espaço disponível.", error);
            return;
        }
        result.put("saved", true);
        call.resolve(result);
    }
}
