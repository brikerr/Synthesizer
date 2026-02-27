import { defineConfig, transformWithEsbuild, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Vite plugin that compiles AudioWorklet processor .ts files to .js during build.
 *
 * The ?url import suffix copies files as-is (no transpile), which means
 * TypeScript processor files end up as .ts in dist/. Browsers can't parse TS,
 * and servers (e.g. Vercel) serve .ts with the wrong MIME type (video/mp2t).
 *
 * This plugin intercepts ?url imports for processor files, compiles them with
 * esbuild, and emits proper .js assets. Only runs during build — in dev mode
 * Vite's dev server already compiles TS on-the-fly.
 */
function audioWorkletPlugin(): Plugin {
  return {
    name: 'audioworklet-ts-compile',
    apply: 'build',
    enforce: 'pre',

    async resolveId(source, importer, options) {
      if (!source.endsWith('?url') || !source.includes('-processor.ts')) return null;

      const cleanSource = source.replace('?url', '');
      const resolved = await this.resolve(cleanSource, importer, { ...options, skipSelf: true });
      if (!resolved) return null;

      return `\0audioworklet:${resolved.id}`;
    },

    async load(id) {
      if (!id.startsWith('\0audioworklet:')) return null;

      const filePath = id.slice('\0audioworklet:'.length);
      const source = fs.readFileSync(filePath, 'utf-8');

      const { code } = await transformWithEsbuild(source, filePath, {
        loader: 'ts',
        minify: false,
      });

      const ref = this.emitFile({
        type: 'asset',
        name: path.basename(filePath, '.ts') + '.js',
        source: code,
      });

      return `export default import.meta.ROLLUP_FILE_URL_${ref}`;
    },
  };
}

export default defineConfig({
  plugins: [audioWorkletPlugin(), react()],
  worker: {
    format: 'es',
  },
  build: {
    // Ensure all processor files are emitted as separate files
    // (not inlined as data URIs) for audioWorklet.addModule()
    assetsInlineLimit: 0,
  },
})
