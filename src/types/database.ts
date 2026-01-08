export interface Product {
    id?: number
    code: string
    name: string
    description?: string
    category?: string
    supplier_id?: number
    supplier_name?: string
    image?: string
    price: number
    cost?: number
    stock: number
    min_stock: number
    unit: string
    created_at?: string
    updated_at?: string
}

export interface Supplier {
    id?: number
    name: string
    contact?: string
    phone?: string
    email?: string
    address?: string
    created_at?: string
}

export interface Client {
    id?: number
    name: string
    tax_id?: string
    address?: string
    phone?: string
    email?: string
    notes?: string
    created_at?: string
    updated_at?: string
}

export interface Category {
    id?: number
    name: string
    description?: string
    created_at?: string
}

export interface Sale {
    id?: number
    items: SaleItem[]
    subtotal: number
    tax: number
    discount: number
    total: number
    payment_method: string
    customer_name?: string
    notes?: string
    status: 'completed' | 'cancelled'
    created_at?: string
}

export interface SaleItem {
    id?: number
    sale_id?: number
    product_id: number
    product_code: string
    product_name: string
    quantity: number
    unit_price: number
    subtotal: number
}

export interface CartItem {
    product: Product
    quantity: number
}

export interface CompanySettings {
    name: string
    address?: string
    phone?: string
    email?: string
    website?: string
    logo?: string // Base64 or URL
    taxId?: string // RFC, NIT, etc.

    // Configuración Regional / Moneda
    currency: string
    currencySymbol: string
    locale: string // 'es-GT', 'es-MX', 'en-US'

    // Impuestos
    enableTax: boolean
    taxRate: number
    taxIncluded: boolean // Si los precios ya incluyen IVA

    // Ventas / POS
    enableDiscounts: boolean
    requireCustomerName: boolean
    askPaymentMethod: boolean
    pos: {
        autoConfirm: boolean
        showChangeCalculation: boolean
        allowNegativeStock: boolean
        soundEffects: boolean
    }

    // Métodos de Pago Habilitados
    paymentMethods: {
        cash: boolean
        card: boolean
        transfer: boolean
        other: boolean
    }

    // Facturación
    invoice: {
        prefix: string
        nextNumber: number
        disclaimer: string // Texto legal al final del ticket
    }

    // Inventario
    inventory: {
        lowStockThreshold: number
        showVisualAlerts: boolean
    }

    // Backups
    backup: {
        autoBackup: boolean
        frequency: 'daily' | 'weekly'
        lastBackupDate?: string
        location?: string
    }

    // Apariencia
    theme: {
        mode: 'light' | 'dark' | 'system'
        density: 'normal' | 'compact'
    }

    // Seguridad
    security: {
        enablePin: boolean
        pin?: string
        lockSettings: boolean
    }
}
