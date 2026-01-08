

export interface Supplier {
    id?: number
    name: string
    contact_name?: string
    email?: string
    phone?: string
    address?: string
    notes?: string
    created_at?: string
}

class SupplierService {
    async getAll(): Promise<Supplier[]> {
        if (!window.electronAPI?.suppliers) {
            throw new Error('Supplier API not available')
        }
        return window.electronAPI.suppliers.getAll()
    }

    async getById(id: number): Promise<Supplier> {
        if (!window.electronAPI?.suppliers) {
            throw new Error('Supplier API not available')
        }
        return window.electronAPI.suppliers.getById(id)
    }

    async create(supplier: Omit<Supplier, 'id' | 'created_at'>): Promise<Supplier> {
        if (!window.electronAPI?.suppliers) {
            throw new Error('Supplier API not available')
        }
        return window.electronAPI.suppliers.create(supplier)
    }

    async update(id: number, supplier: Partial<Omit<Supplier, 'id' | 'created_at'>>): Promise<Supplier> {
        if (!window.electronAPI?.suppliers) {
            throw new Error('Supplier API not available')
        }
        return window.electronAPI.suppliers.update(id, supplier)
    }

    async delete(id: number): Promise<{ success: boolean }> {
        if (!window.electronAPI?.suppliers) {
            throw new Error('Supplier API not available')
        }
        return window.electronAPI.suppliers.delete(id)
    }
}

export const supplierService = new SupplierService()
