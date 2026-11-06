import path from 'node:path';
import { defineConfig } from 'vitest/config';

const root = import.meta.dirname;

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(root, 'src'),
            // Next.js provides this module at build time; tests run outside Next
            'server-only': path.resolve(root, 'node_modules/next/dist/compiled/server-only/empty.js'),
        },
    },
    oxc: { jsx: { runtime: 'automatic' } },
    test: {
        include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
        environment: 'node',
    },
});
