import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.parthkaroli.gpsmapcamera',
  appName: 'GPS Map Camera',
  webDir: 'dist',
  android: { allowMixedContent: false },
  plugins: {
    CapacitorSQLite: { androidIsEncryption: false }
  }
};

export default config;
