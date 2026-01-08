import { CompanySettings } from '@/types/database'

const STORAGE_KEY = 'cerocloud_company_settings'

const defaultSettings: CompanySettings = {
    name: 'CeroCloud',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: '',
    taxId: '',

    // Sales Defaults
    currency: 'GTQ',
    currencySymbol: 'Q',
    locale: 'es-GT',
    taxRate: 12,
    enableTax: true,
    taxIncluded: true,

    // POS Defaults
    enableDiscounts: true,
    requireCustomerName: false,
    askPaymentMethod: true,
    pos: {
        autoConfirm: false,
        showChangeCalculation: true,
        allowNegativeStock: false,
        soundEffects: true
    },

    paymentMethods: {
        cash: true,
        card: true,
        transfer: true,
        other: false
    },

    invoice: {
        prefix: 'FAC-',
        nextNumber: 1,
        disclaimer: 'Gracias por su compra. -- CeroCloud --'
    },

    inventory: {
        lowStockThreshold: 5,
        showVisualAlerts: true
    },

    backup: {
        autoBackup: false,
        frequency: 'weekly'
    },

    theme: {
        mode: 'system',
        density: 'normal'
    },

    security: {
        enablePin: false,
        lockSettings: false
    }
}

export const companyService = {
    // Get company settings
    getSettings: (): CompanySettings => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                // Merge stored settings with defaults to ensure new fields (like currencySymbol) exist
                return { ...defaultSettings, ...JSON.parse(stored) }
            }
            return defaultSettings
        } catch (error) {
            console.error('Error loading company settings:', error)
            return defaultSettings
        }
    },

    // Save company settings
    saveSettings: (settings: CompanySettings): boolean => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
            // Dispatch event for reactive updates in other components
            window.dispatchEvent(new Event('company-settings-changed'))
            return true
        } catch (error) {
            console.error('Error saving company settings:', error)
            return false
        }
    },

    // Update logo
    updateLogo: (logoBase64: string): boolean => {
        try {
            const settings = companyService.getSettings()
            settings.logo = logoBase64
            return companyService.saveSettings(settings)
        } catch (error) {
            console.error('Error updating logo:', error)
            return false
        }
    },

    // Remove logo
    removeLogo: (): boolean => {
        try {
            const settings = companyService.getSettings()
            settings.logo = ''
            return companyService.saveSettings(settings)
        } catch (error) {
            console.error('Error removing logo:', error)
            return false
        }
    },

    // Apply theme to document
    applyTheme: (mode: 'light' | 'dark' | 'system') => {
        try {
            const root = document.documentElement
            const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

            root.classList.remove('light', 'dark')
            if (isDark) {
                root.classList.add('dark')
            } else {
                root.classList.add('light')
            }
        } catch (error) {
            console.error('Error applying theme:', error)
        }
    },

    // Initialize theme on app start
    initTheme: () => {
        const settings = companyService.getSettings()
        if (settings.theme?.mode) {
            companyService.applyTheme(settings.theme.mode)
        }
    }
}
