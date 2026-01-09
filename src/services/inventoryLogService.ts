import { InventoryLog } from '@/types/database'

// Mock IPC para desarrollo web
const isMockMode = !window.electronAPI

const mockLogs: InventoryLog[] = []

export const inventoryLogService = {
    // Obtener todos los logs
    async getAll(): Promise<InventoryLog[]> {
        if (isMockMode) return mockLogs
        return window.electronAPI.inventoryLogs.getAll()
    },

    // Obtener logs de un producto específico
    async getByProductId(productId: number): Promise<InventoryLog[]> {
        if (isMockMode) return mockLogs.filter(log => log.product_id === productId)
        return window.electronAPI.inventoryLogs.getByProductId(productId)
    },

    // Obtener logs por tipo de movimiento
    async getByMovementType(movementType: string): Promise<InventoryLog[]> {
        if (isMockMode) return mockLogs.filter(log => log.movement_type === movementType)
        return window.electronAPI.inventoryLogs.getByMovementType(movementType)
    },

    // Obtener logs en un rango de fechas
    async getByDateRange(startDate: string, endDate: string): Promise<InventoryLog[]> {
        if (isMockMode) {
            return mockLogs.filter(log =>
                log.created_at && log.created_at >= startDate && log.created_at <= endDate
            )
        }
        return window.electronAPI.inventoryLogs.getByDateRange(startDate, endDate)
    },

    // Obtener logs recientes
    async getRecent(limit: number = 50): Promise<InventoryLog[]> {
        if (isMockMode) return mockLogs.slice(0, limit)
        return window.electronAPI.inventoryLogs.getRecent(limit)
    },

    // Crear log manualmente (para ajustes manuales desde UI)
    async create(log: Omit<InventoryLog, 'id'>): Promise<InventoryLog> {
        if (isMockMode) {
            const newLog: InventoryLog = { ...log, id: mockLogs.length + 1 }
            mockLogs.push(newLog)
            return newLog
        }
        return window.electronAPI.inventoryLogs.create(log)
    },
    async getCount(): Promise<number> {
        if (isMockMode) return mockLogs.length
        return window.electronAPI.inventoryLogs.count()
    }
}
