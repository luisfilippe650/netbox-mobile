package br.gov.inpe.netboxmobile;

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

@CapacitorPlugin(name = "SecureSession")
public class SecureSessionPlugin extends Plugin {
    private static final String ANDROID_KEY_STORE = "AndroidKeyStore";
    private static final String KEY_ALIAS = "netbox_mobile_session_key";
    private static final String PREFERENCES = "secure_session";
    private static final String CIPHERTEXT = "token_ciphertext";
    private static final String IV = "token_iv";

    @PluginMethod
    public void save(PluginCall call) {
        String value = call.getString("value");
        if (value == null || value.isEmpty()) {
            call.reject("A sessão segura não recebeu um token válido.");
            return;
        }

        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey());
            byte[] encrypted = cipher.doFinal(value.getBytes(StandardCharsets.UTF_8));
            boolean saved = preferences()
                .edit()
                .putString(CIPHERTEXT, Base64.encodeToString(encrypted, Base64.NO_WRAP))
                .putString(IV, Base64.encodeToString(cipher.getIV(), Base64.NO_WRAP))
                .commit();
            if (!saved) {
                call.reject("Não foi possível persistir a sessão segura.");
                return;
            }
            call.resolve();
        } catch (Exception error) {
            call.reject("Não foi possível proteger a sessão no Android Keystore.", error);
        }
    }

    @PluginMethod
    public void load(PluginCall call) {
        String ciphertext = preferences().getString(CIPHERTEXT, null);
        String iv = preferences().getString(IV, null);
        JSObject result = new JSObject();
        if (ciphertext == null || iv == null) {
            call.resolve(result);
            return;
        }

        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(
                Cipher.DECRYPT_MODE,
                getOrCreateKey(),
                new GCMParameterSpec(128, Base64.decode(iv, Base64.NO_WRAP))
            );
            byte[] decrypted = cipher.doFinal(Base64.decode(ciphertext, Base64.NO_WRAP));
            result.put("value", new String(decrypted, StandardCharsets.UTF_8));
            call.resolve(result);
        } catch (Exception error) {
            preferences().edit().clear().commit();
            call.reject("A sessão segura armazenada não pôde ser recuperada.", error);
        }
    }

    @PluginMethod
    public void clear(PluginCall call) {
        if (preferences().edit().clear().commit()) {
            call.resolve();
        } else {
            call.reject("Não foi possível remover a sessão segura.");
        }
    }

    private SharedPreferences preferences() {
        return getContext().getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE);
    }

    private SecretKey getOrCreateKey() throws Exception {
        KeyStore keyStore = KeyStore.getInstance(ANDROID_KEY_STORE);
        keyStore.load(null);
        SecretKey existingKey = (SecretKey) keyStore.getKey(KEY_ALIAS, null);
        if (existingKey != null) return existingKey;

        KeyGenerator generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEY_STORE);
        generator.init(
            new KeyGenParameterSpec.Builder(
                KEY_ALIAS,
                KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT
            )
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setRandomizedEncryptionRequired(true)
                .build()
        );
        return generator.generateKey();
    }
}
