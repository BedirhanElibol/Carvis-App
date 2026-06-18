import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        // Test environment
        environment: 'jsdom',

        // Global setup
        setupFiles: ['./src/test/setupTests.js'],

        // Globals (describe, it, expect)
        globals: true,

        // Coverage
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.{js,jsx}'],
            exclude: [
                'src/test/**',
                'src/**/*.test.{js,jsx}',
                'src/constants/**',
            ],
        },

        // Include patterns
        include: ['src/**/*.{test,spec}.{js,jsx}'],

        // Watch exclude
        watchExclude: ['node_modules', 'dist'],
    },
    resolve: {
        alias: {
            '@': path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([a-z]:)/i, '$1'), './src'),
        },
    },
});
