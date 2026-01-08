import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        react(),
        electron([
            {
                // Main process entry file
                entry: 'electron/main/main.ts',
                onstart({ startup }) {
                    startup()
                },
                vite: {
                    build: {
                        outDir: 'dist-electron/main',
                        rollupOptions: {
                            external: ['electron', 'better-sqlite3'],
                            output: {
                                format: 'cjs'
                            }
                        }
                    }
                }
            },
            {
                // Preload scripts
                entry: 'electron/preload/preload.ts',
                onstart({ reload }) {
                    reload()
                },
                vite: {
                    build: {
                        outDir: 'dist-electron/preload',
                        rollupOptions: {
                            external: ['electron']
                        }
                    }
                }
            }
        ]),
        renderer()
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@electron': path.resolve(__dirname, './electron')
        }
    },
    server: {
        port: 5173,
        strictPort: true
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true
    },
    optimizeDeps: {
        exclude: ['electron']
    }
})
