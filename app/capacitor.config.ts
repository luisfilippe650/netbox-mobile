import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.gov.inpe.netboxmobile',
  appName: 'Gerenciador de Datacenter',
  webDir: 'dist',
  // Necessário enquanto a instância local do NetBox estiver servindo apenas HTTP.
  // Em produção, use HTTPS e remova cleartext.
  server: {
    androidScheme: 'http',
    cleartext: true,
  },
};

export default config;
