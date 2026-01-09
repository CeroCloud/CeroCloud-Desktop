import { autoUpdater } from 'electron-updater'
import { BrowserWindow, ipcMain, app } from 'electron'
import log from 'electron-log'

// Configurar logging para debugging
autoUpdater.logger = log
log.transports.file.level = 'info'

export class AutoUpdateService {
    private mainWindow: BrowserWindow | null = null
    private updateCheckInterval: NodeJS.Timeout | null = null

    constructor(window: BrowserWindow) {
        this.mainWindow = window
        this.setupAutoUpdater()
        this.setupIpcHandlers()
    }

    private setupAutoUpdater() {
        // Configuración del auto-updater
        autoUpdater.autoDownload = false // Descarga manual, primero notificar
        autoUpdater.autoInstallOnAppQuit = true // Instalar al cerrar

        // Configurar para GitHub Releases
        autoUpdater.setFeedURL({
            provider: 'github',
            owner: 'CeroCloud',
            repo: 'CeroCloud-Desktop',
        })

        // Event listeners
        autoUpdater.on('checking-for-update', () => {
            log.info('🔍 Verificando actualizaciones...')
            this.sendStatusToWindow('checking-for-update')
        })

        autoUpdater.on('update-available', (info) => {
            log.info('✅ Actualización disponible:', info.version)
            this.sendStatusToWindow('update-available', {
                version: info.version,
                releaseDate: info.releaseDate,
                releaseNotes: info.releaseNotes,
            })
        })

        autoUpdater.on('update-not-available', (info) => {
            log.info('✅ Ya estás en la última versión:', info.version)
            this.sendStatusToWindow('update-not-available', { version: info.version })
        })

        autoUpdater.on('error', (err) => {
            log.error('❌ Error en auto-updater:', err)
            this.sendStatusToWindow('error', { message: err.message })
        })

        autoUpdater.on('download-progress', (progressObj) => {
            const logMessage = `Descargando: ${progressObj.percent.toFixed(2)}% - ${(progressObj.transferred / 1024 / 1024).toFixed(2)}MB / ${(progressObj.total / 1024 / 1024).toFixed(2)}MB`
            log.info(logMessage)
            this.sendStatusToWindow('download-progress', {
                percent: progressObj.percent,
                transferred: progressObj.transferred,
                total: progressObj.total,
                bytesPerSecond: progressObj.bytesPerSecond,
            })
        })

        autoUpdater.on('update-downloaded', (info) => {
            log.info('✅ Actualización descargada:', info.version)
            this.sendStatusToWindow('update-downloaded', {
                version: info.version,
                releaseNotes: info.releaseNotes,
            })
        })
    }

    private setupIpcHandlers() {
        // Handler para verificar actualizaciones manualmente
        ipcMain.handle('updater:check-for-updates', async () => {
            // En desarrollo, no intentar verificar
            if (!app.isPackaged) {
                return {
                    success: false,
                    error: 'Auto-updater no disponible en modo desarrollo. Usa npm run build para probar.'
                }
            }

            try {
                const result = await autoUpdater.checkForUpdates()
                return { success: true, data: result }
            } catch (error) {
                log.error('Error al verificar actualizaciones:', error)
                return { success: false, error: error instanceof Error ? error.message : String(error) }
            }
        })

        // Handler para descargar actualización
        ipcMain.handle('updater:download-update', async () => {
            if (!app.isPackaged) {
                return { success: false, error: 'No disponible en desarrollo' }
            }

            try {
                await autoUpdater.downloadUpdate()
                return { success: true }
            } catch (error) {
                log.error('Error al descargar actualización:', error)
                return { success: false, error: error instanceof Error ? error.message : String(error) }
            }
        })

        // Handler para instalar actualización y reiniciar
        ipcMain.handle('updater:quit-and-install', () => {
            if (!app.isPackaged) return
            autoUpdater.quitAndInstall(false, true)
        })

        // Handler para obtener versión actual
        ipcMain.handle('updater:get-current-version', () => {
            return app.getVersion()
        })

        // Handler para configurar auto-verificación
        ipcMain.handle('updater:set-auto-check', (_event, enabled: boolean, intervalHours: number = 6) => {
            if (!app.isPackaged) {
                return { success: false, error: 'No disponible en desarrollo' }
            }

            if (enabled) {
                this.startAutoCheck(intervalHours)
            } else {
                this.stopAutoCheck()
            }
            return { success: true }
        })
    }

    private sendStatusToWindow(event: string, data?: unknown) {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send('updater-status', { event, data })
        }
    }

    /**
     * Verificar actualizaciones al iniciar la app
     * Se ejecuta 5 segundos después del inicio para no interferir con la carga
     */
    public checkForUpdatesOnStartup() {
        setTimeout(() => {
            log.info('🚀 Verificación automática al inicio')
            autoUpdater.checkForUpdates().catch((err) => {
                log.error('Error en verificación de inicio:', err)
            })
        }, 5000)
    }

    /**
     * Iniciar verificación automática periódica
     * @param intervalHours - Intervalo en horas (default: 6 horas)
     */
    public startAutoCheck(intervalHours: number = 6) {
        if (this.updateCheckInterval) {
            clearInterval(this.updateCheckInterval)
        }

        const intervalMs = intervalHours * 60 * 60 * 1000
        log.info(`⏰ Auto-verificación configurada cada ${intervalHours} horas`)

        this.updateCheckInterval = setInterval(() => {
            log.info('⏰ Verificación automática programada')
            autoUpdater.checkForUpdates().catch((err) => {
                log.error('Error en verificación automática:', err)
            })
        }, intervalMs)

        // Primera verificación inmediata
        this.checkForUpdatesOnStartup()
    }

    /**
     * Detener verificación automática
     */
    public stopAutoCheck() {
        if (this.updateCheckInterval) {
            clearInterval(this.updateCheckInterval)
            this.updateCheckInterval = null
            log.info('⏹️ Auto-verificación deshabilitada')
        }
    }

    /**
     * Destruir el servicio (limpiar recursos)
     */
    public destroy() {
        this.stopAutoCheck()
        this.mainWindow = null
    }
}
