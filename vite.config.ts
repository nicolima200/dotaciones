import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { writeFileSync } from 'fs';

// Simple plugin to write version.json with the build timestamp
function writeVersionJson(version: string) {
  return {
    name: 'write-version-json',
    writeBundle(options: any) {
      const outDir = options.dir || 'dist';
      const filePath = path.join(outDir, 'version.json');
      try {
        writeFileSync(filePath, JSON.stringify({ version }));
        console.log(`\n[Version Plugin] Generated version.json with version: ${version}`);
      } catch (err) {
        console.error('Failed to write version.json:', err);
      }
    }
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const buildVersion = Date.now().toString();

  return {
    plugins: [
      react(), 
      tailwindcss(),
      writeVersionJson(buildVersion)
    ],
    define: {
      '__APP_VERSION__': JSON.stringify(buildVersion),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
