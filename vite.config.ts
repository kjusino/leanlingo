import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

// Copy dist/index.html to dist/404.html so GitHub Pages serves the SPA shell
// for any deep-link path that isn't a real file. Standard SPA-on-Pages trick.
function spa404(): import('vite').Plugin {
    return {
        name: 'spa-404',
        closeBundle() {
            const out = path.resolve('dist');
            const src = path.join(out, 'index.html');
            const dst = path.join(out, '404.html');
            if (fs.existsSync(src)) fs.copyFileSync(src, dst);
        },
    };
}

export default defineConfig({
    base: '/',
    plugins: [react(), spa404()],
});
