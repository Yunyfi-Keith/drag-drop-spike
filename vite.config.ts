import {defineConfig} from 'vite';

export default defineConfig({
    build: {
        sourcemap: true,
        minify: false
    },
    esbuild: {
        target: 'es2022',
    },
});

