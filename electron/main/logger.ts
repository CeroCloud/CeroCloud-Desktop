import { app } from 'electron'
import path from 'path'
import fs from 'fs'

const LOG_FILENAME = 'app-errors.log'

// Función auxiliar para obtener la ruta del log de manera segura
// (app.getPath podría fallar si se llama antes de app.ready, aunque es raro en módulos importados después)
const getLogPath = () => {
    try {
        return path.join(app.getPath('userData'), LOG_FILENAME)
    } catch {
        return path.join(process.cwd(), LOG_FILENAME) // Fallback
    }
}

export const logger = {
    error: (context: string, error: unknown) => {
        const timestamp = new Date().toISOString()
        const errorMessage = error instanceof Error ? error.stack || error.message : String(error)

        const logLine = `[${timestamp}] [ERROR] [${context}] ${errorMessage}\n` +
            `--------------------------------------------------------------------------------\n`

        // Siempre mostrar en consola para dev
        console.error(`[${context}]`, error)

        try {
            fs.appendFileSync(getLogPath(), logLine, 'utf-8')
        } catch (writeErr) {
            console.error('❌ FALLÓ ESCRITURA DE LOG:', writeErr)
        }
    },

    info: (context: string, message: string) => {
        const timestamp = new Date().toISOString()
        const logLine = `[${timestamp}] [INFO] [${context}] ${message}\n`

        console.log(`[${context}] ${message}`)

        try {
            fs.appendFileSync(getLogPath(), logLine, 'utf-8')
        } catch (writeErr) {
            console.error('❌ FALLÓ ESCRITURA DE LOG:', writeErr)
        }
    },

    // Limpiar logs antiguos si el archivo es muy grande (> 5MB)
    rotate: () => {
        try {
            const logPath = getLogPath()
            if (fs.existsSync(logPath)) {
                const stats = fs.statSync(logPath)
                if (stats.size > 5 * 1024 * 1024) { // 5MB
                    const backupPath = logPath + '.old'
                    if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath)
                    fs.renameSync(logPath, backupPath)
                    logger.info('Logger', 'Log rotado por tamaño excesivo')
                }
            }
        } catch (e) {
            console.error('Error rotando logs:', e)
        }
    }
}
