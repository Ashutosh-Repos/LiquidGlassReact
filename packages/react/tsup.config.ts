import { defineConfig } from 'tsup';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const USE_CLIENT_DIRECTIVE = '"use client";\n';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react', 'react-dom'],
  async onSuccess() {
    // Prepend "use client" after the build completes.
    // This avoids the esbuild/rollup directive-stripping behavior.
    // Using process.cwd() is fully backward-compatible and has perfect TS type support.
    const distDir = join(process.cwd(), 'dist');
    const files = ['index.js', 'index.cjs'];

    for (const file of files) {
      const filePath = join(distDir, file);
      const content = readFileSync(filePath, 'utf-8');
      if (!content.startsWith('"use client"')) {
        writeFileSync(filePath, USE_CLIENT_DIRECTIVE + content);
      }
    }
    console.log('✅ Prepended "use client" to ESM and CJS outputs');
  },
});
