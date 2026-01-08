/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_NAME: string
    readonly VITE_DB_PATH: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

// Electron API Types
interface ElectronAPI {
    products: {
        getAll: () => Promise<any[]>
        getById: (id: number) => Promise<any>
        search: (term: string) => Promise<any[]>
        create: (product: any) => Promise<any>
        createOrUpdate: (product: any) => Promise<{ product: any; isNew: boolean }>
        update: (id: number, product: any) => Promise<any>
        delete: (id: number) => Promise<{ success: boolean }>
        getLowStock: () => Promise<any[]>
        saveImage: (sourcePath: string) => Promise<string>
        getImage: (filename: string) => Promise<{ success: boolean; buffer?: Uint8Array; error?: string }>
        restoreImage: (filename: string, buffer: Uint8Array) => Promise<void>
    }
    categories: {
        getAll: () => Promise<any[]>
        create: (name: string, description?: string) => Promise<any>
    }
    sales: {
        getAll: () => Promise<any[]>
        getById: (id: number) => Promise<any>
        getRecent: (limit?: number) => Promise<any[]>
        getTotalSales: () => Promise<number>
        getSalesToday: () => Promise<any[]>
        create: (sale: any) => Promise<any>
        cancel: (id: number) => Promise<any>
    }
    suppliers: {
        getAll: () => Promise<any[]>
        getById: (id: number) => Promise<any>
        create: (supplier: any) => Promise<any>
        update: (id: number, supplier: any) => Promise<any>
        delete: (id: number) => Promise<{ success: boolean }>
    }
    backup: {
        create: (password?: string) => Promise<{ path: string; filename: string; encrypted: boolean }>
        createZip: (password?: string) => Promise<{ buffer: Uint8Array; filename: string; encrypted: boolean }>
        restore: (backupPath: string, password?: string) => Promise<{ success: boolean }>
        restoreFromBuffer: (buffer: Uint8Array, password?: string) => Promise<{ success: boolean }>
        verifyBackup: (backupPath: string, password?: string) => Promise<any>
        verifyBackupBuffer: (buffer: Uint8Array, password?: string) => Promise<any>
    }
    company: {
        get: () => Promise<any>
        update: (data: any) => Promise<void>
    }
}

interface Window {
    electronAPI: ElectronAPI
}
