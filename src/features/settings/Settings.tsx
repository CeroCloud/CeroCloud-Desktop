import { useState, useEffect } from 'react'
import {
    Building2,
    CreditCard,
    Package,
    Database,
    Palette,
    RefreshCw,
    Save
} from 'lucide-react'
import { companyService } from '@/services/companyService'
import { CompanySettings } from '@/types/database'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { BackupWizard } from '@/components/backup/BackupWizard'
import { RestoreWizard } from '@/components/backup/RestoreWizard'
import pkg from '../../../package.json'
import { GeneralTab } from './tabs/GeneralTab'
import { SalesTab } from './tabs/SalesTab'
import { InventoryTab } from './tabs/InventoryTab'
import { BackupsTab } from './tabs/BackupsTab'
import { AppearanceTab } from './tabs/AppearanceTab'
import { UpdatesTab } from './tabs/UpdatesTab'

export function Settings() {
    const [settings, setSettings] = useState<CompanySettings>(companyService.getSettings())
    const [logoPreview, setLogoPreview] = useState(settings.logo || '')
    const [activeTab, setActiveTab] = useState<'general' | 'sales' | 'inventory' | 'backups' | 'appearance' | 'updates'>('general')
    const [saving, setSaving] = useState(false)
    const [showBackupWizard, setShowBackupWizard] = useState(false)
    const [showRestoreWizard, setShowRestoreWizard] = useState(false)

    // Ensure we load fresh settings on mount
    useEffect(() => {
        const current = companyService.getSettings()
        setSettings(current)
        setLogoPreview(current.logo || '')
    }, [])

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('El logo debe ser menor a 2MB')
                return
            }
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64 = reader.result as string
                setSettings(prev => ({ ...prev, logo: base64 }))
                setLogoPreview(base64)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleRemoveLogo = () => {
        setSettings(prev => ({ ...prev, logo: '' }))
        setLogoPreview('')
    }

    const handleSave = () => {
        setSaving(true)
        setTimeout(() => {
            const success = companyService.saveSettings(settings)
            if (success) {
                toast.success('Configuración guardada exitosamente')
            } else {
                toast.error('Error al guardar configuración')
            }
            setSaving(false)
        }, 800)
    }

    // Tabs definition
    const tabs = [
        { id: 'general', label: 'General', icon: Building2, desc: 'Identidad y locación' },
        { id: 'sales', label: 'Ventas y POS', icon: CreditCard, desc: 'Métodos de pago y facturas' },
        { id: 'inventory', label: 'Inventario', icon: Package, desc: 'Stock y alertas' },
        { id: 'backups', label: 'Respaldos', icon: Database, desc: 'Copias de seguridad' },
        { id: 'appearance', label: 'Apariencia', icon: Palette, desc: 'Tema y diseño' },
        { id: 'updates', label: 'Sistema', icon: RefreshCw, desc: 'Versión y actualizaciones' },
    ]

    return (
        <div className="h-[calc(100vh-theme(spacing.16))] flex flex-col bg-gray-50/50 dark:bg-gray-950 overflow-hidden">

            {/* Header Area with Horizontal Nav */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10 shadow-sm/5">
                <div className="max-w-7xl mx-auto px-6 pt-8 pb-0">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                Configuración
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                Gestiona y personaliza cada aspecto de tu negocio.
                            </p>
                        </div>
                        <div className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md mb-2">
                            v{pkg.version}
                        </div>
                    </div>

                    {/* Horizontal Scrollable Tabs */}
                    <nav className="flex items-center gap-8 overflow-x-auto pb-0 -mb-px mask-gradient-right no-scrollbar">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                    className={cn(
                                        "group flex items-center gap-2 pb-4 border-b-[3px] transition-all whitespace-nowrap outline-none select-none",
                                        isActive
                                            ? "border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                            : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700"
                                    )}
                                >
                                    <tab.icon className={cn(
                                        "w-5 h-5 transition-colors",
                                        isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 group-hover:text-gray-500"
                                    )} />
                                    <span className={cn("text-base font-medium", isActive && "font-bold")}>{tab.label}</span>
                                </button>
                            )
                        })}
                    </nav>
                </div>
            </div>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth bg-gray-50/50 dark:bg-slate-900">
                <div className="max-w-5xl mx-auto p-6 lg:p-10 pb-32">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="w-full"
                        >
                            {activeTab === 'general' && (
                                <GeneralTab
                                    settings={settings}
                                    setSettings={setSettings}
                                    logoPreview={logoPreview}
                                    handleLogoUpload={handleLogoUpload}
                                    handleRemoveLogo={handleRemoveLogo}
                                />
                            )}
                            {activeTab === 'sales' && (
                                <SalesTab settings={settings} setSettings={setSettings} />
                            )}
                            {activeTab === 'inventory' && (
                                <InventoryTab settings={settings} setSettings={setSettings} />
                            )}
                            {activeTab === 'backups' && (
                                <BackupsTab
                                    settings={settings}
                                    setSettings={setSettings}
                                    onOpenWizard={() => setShowBackupWizard(true)}
                                    onOpenRestoreWizard={() => setShowRestoreWizard(true)}
                                />
                            )}
                            {activeTab === 'updates' && (
                                <UpdatesTab settings={settings} setSettings={setSettings} />
                            )}
                            {activeTab === 'appearance' && (
                                <AppearanceTab settings={settings} setSettings={setSettings} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Floating Save Button */}
                <div className="fixed bottom-8 right-8 z-50 pointer-events-none">
                    <AnimatePresence>
                        {(JSON.stringify(settings) !== JSON.stringify(companyService.getSettings()) || saving) && (
                            <motion.div
                                initial={{ y: 20, opacity: 0, scale: 0.9 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                exit={{ y: 20, opacity: 0, scale: 0.9 }}
                                className="pointer-events-auto"
                            >
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-3 px-6 py-3 bg-gray-900 dark:bg-indigo-600 text-white rounded-full font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all hover:shadow-indigo-500/25 border border-white/20 backdrop-blur-md"
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Save className="w-5 h-5" />
                                    )}
                                    <span className="text-sm font-bold tracking-wide">{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {showBackupWizard && <BackupWizard onClose={() => setShowBackupWizard(false)} />}
            {showRestoreWizard && <RestoreWizard onClose={() => setShowRestoreWizard(false)} onRestoreComplete={() => setShowRestoreWizard(false)} />}
        </div>
    )
}