import { useState, useEffect } from 'react'
import { UpdateInfo } from '@/services/updaterService'
import {
    Building2,
    Upload,
    X,
    Save,
    Settings as SettingsIcon,
    CreditCard,
    Package,
    Database,
    Palette,
    Shield,
    RefreshCw,
    Sun,
    Moon,
    Monitor,
    Check,
    Download,
    AlertTriangle,
    Banknote,
    QrCode,
    Github,
    FileText,
    MessageSquare,
    Camera,
    Store,
    MapPin,
    Phone,
    Coins,
    MoreHorizontal,
    Receipt,
    Calculator,
    AlertCircle,
    Percent,
    User,
    Building
} from 'lucide-react'
import { companyService } from '@/services/companyService'
import { CompanySettings } from '@/types/database'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { BackupWizard } from '@/components/backup/BackupWizard'
import { RestoreWizard } from '@/components/backup/RestoreWizard'

export function Settings() {
    const [settings, setSettings] = useState<CompanySettings>(companyService.getSettings())
    const [logoPreview, setLogoPreview] = useState(settings.logo || '')
    const [activeTab, setActiveTab] = useState<'general' | 'sales' | 'inventory' | 'backups' | 'appearance' | 'updates' | 'about'>('general')
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
        { id: 'general', label: 'General', icon: Building2 },
        { id: 'sales', label: 'Ventas / POS', icon: CreditCard },
        { id: 'inventory', label: 'Inventario', icon: Package },
        { id: 'backups', label: 'Backups', icon: Database },
        { id: 'updates', label: 'Actualizaciones', icon: RefreshCw },
        { id: 'appearance', label: 'Apariencia', icon: Palette },
    ]

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                    <SettingsIcon className="w-8 h-8 text-indigo-500" />
                    Configuración
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Panel de decisiones de tu negocio
                </p>
            </div>

            {/* Navigation Tabs */}
            {/* Navigation Tabs - Modern Segmented Control Style */}
            <div className="bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl flex overflow-x-auto gap-1 border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={cn(
                            "px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap text-sm flex-1 justify-center",
                            activeTab === tab.id
                                ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-md border border-gray-200 dark:border-gray-700"
                                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
                        )}
                    >
                        <tab.icon className={cn("w-4 h-4", activeTab === tab.id && "text-indigo-500")} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-gray-800 rounded-b-2xl rounded-tr-2xl shadow-xl border border-gray-300 dark:border-gray-700 p-8 min-h-[500px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
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
                            <UpdatesTab />
                        )}
                        {activeTab === 'appearance' && (
                            <AppearanceTab settings={settings} setSettings={setSettings} />
                        )}
                        {activeTab === 'about' && (
                            <AboutTab />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {showBackupWizard && <BackupWizard onClose={() => setShowBackupWizard(false)} />}
            {showRestoreWizard && <RestoreWizard onClose={() => setShowRestoreWizard(false)} onRestoreComplete={() => setShowRestoreWizard(false)} />}

            {/* Floating Save Button */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-8 right-8 z-40"
            >
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-gray-900 rounded-full font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all text-lg border-2 border-transparent hover:border-white/20"
                >
                    {saving ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </motion.div>
        </div>
    )
}

/* --- SUBCOMPONENTS --- */

function SectionTitle({ title, description }: { title: string, description?: string }) {
    return (
        <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {title}
            </h3>
            {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
    )
}

interface GeneralTabProps {
    settings: CompanySettings
    setSettings: (settings: CompanySettings) => void
    logoPreview: string
    handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleRemoveLogo: () => void
}

function GeneralTab({ settings, setSettings, logoPreview, handleLogoUpload, handleRemoveLogo }: GeneralTabProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Branding (1/3 width) */}
            <div className="md:col-span-1 space-y-6">
                <SectionTitle title="Marca" description="Logo de tu negocio." />

                <div className="relative group">
                    <div className={cn(
                        "aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all overflow-hidden relative",
                        logoPreview
                            ? "border-indigo-500/50 bg-indigo-50/10"
                            : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-indigo-500/50 hover:bg-indigo-50/10"
                    )}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />

                        {logoPreview ? (
                            <>
                                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2 relative z-10" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20">
                                    <span className="text-white font-bold text-sm flex items-center gap-2">
                                        <Camera className="w-4 h-4" /> Cambiar
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-6">
                                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                    <Store className="w-8 h-8" />
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-1">Subir Logo</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Recomendado: 500x500px<br />(PNG o JPG)
                                </p>
                            </div>
                        )}
                    </div>
                    {/* Helper text under logo */}
                    <p className="text-xs text-center text-gray-400 mt-3">
                        Este logo aparecerá en tickets y reportes.
                    </p>
                    {logoPreview && (
                        <button
                            onClick={handleRemoveLogo}
                            className="absolute top-2 right-2 z-30 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Eliminar logo"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Right Column: Details & Settings (2/3 width) */}
            <div className="md:col-span-2 space-y-8">
                {/* Business Info */}
                <div>
                    <SectionTitle title="Información del Negocio" description="Datos públicos para tus clientes." />
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-300 dark:border-gray-700 shadow-md space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Nombre Comercial</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={settings.name}
                                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                                    className="pl-10 form-input text-lg font-bold"
                                    placeholder="Ej. Mi Tienda Increíble"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Dirección</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={settings.address || ''}
                                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                        className="pl-10 form-input"
                                        placeholder="Ciudad, País"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Teléfono</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={settings.phone || ''}
                                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                        className="pl-10 form-input"
                                        placeholder="+502 0000 0000"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Regional Settings */}
                <div>
                    <SectionTitle title="Moneda e Impuestos" description="Adapta el sistema a tu región." />
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-300 dark:border-gray-700 shadow-md grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                        {/* Currency */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Moneda Principal</label>
                            <div className="relative">
                                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <div className="pl-10 relative">
                                    <select
                                        value={settings.currency}
                                        onChange={(e) => {
                                            const val = e.target.value
                                            let sym = '$'
                                            if (val === 'GTQ') sym = 'Q'
                                            if (val === 'EUR') sym = '€'
                                            setSettings({ ...settings, currency: val, currencySymbol: sym })
                                        }}
                                        className="form-input pr-16 appearance-none"
                                    >
                                        <option value="GTQ">Quetzales (GTQ)</option>
                                        <option value="USD">Dólares (USD)</option>
                                        <option value="EUR">Euros (EUR)</option>
                                        <option value="MXN">Pesos (MXN)</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs pointer-events-none">
                                        {settings.currencySymbol}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tax */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Impuesto (IVA)</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase font-bold text-gray-400">Activo</span>
                                    <Switch
                                        checked={settings.enableTax}
                                        onChange={(c) => setSettings({ ...settings, enableTax: c })}
                                    />
                                </div>
                            </div>

                            {settings.enableTax && (
                                <div className="relative animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-24">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-400 font-bold text-xs">
                                                %
                                            </div>
                                            <input
                                                type="number"
                                                value={settings.taxRate}
                                                onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                                                className="pl-8 form-input font-bold"
                                                placeholder="12"
                                            />
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={settings.taxIncluded}
                                                onChange={(e) => setSettings({ ...settings, taxIncluded: e.target.checked })}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                            />
                                            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Incluido en precios</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                            {!settings.enableTax && (
                                <p className="text-xs text-gray-400 py-2.5">Impuestos desactivados para ventas.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface SettingsTabProps {
    settings: CompanySettings
    setSettings: (settings: CompanySettings) => void
}

function SalesTab({ settings, setSettings }: SettingsTabProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Payments & Invoice */}
            <div className="space-y-8">
                {/* Payment Methods */}
                <div>
                    <SectionTitle title="Métodos de Pago" description="Gestiona cómo cobrarás a tus clientes." />
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { id: 'cash', label: 'Efectivo', icon: Banknote, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
                            { id: 'card', label: 'Tarjeta', icon: CreditCard, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
                            { id: 'transfer', label: 'Transfer.', icon: QrCode, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
                            { id: 'other', label: 'Otros', icon: MoreHorizontal, color: 'text-gray-600 bg-gray-50 dark:bg-gray-800' },
                        ].map((method) => {
                            const isEnabled = settings.paymentMethods?.[method.id as keyof typeof settings.paymentMethods] ?? true
                            return (
                                <div
                                    key={method.id}
                                    onClick={() => setSettings({
                                        ...settings,
                                        paymentMethods: { ...settings.paymentMethods, [method.id]: !isEnabled }
                                    })}
                                    className={cn(
                                        "cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-3 text-center group",
                                        isEnabled
                                            ? "border-indigo-500 bg-indigo-50/10 dark:bg-indigo-900/10"
                                            : "border-gray-400 dark:border-gray-800 opacity-60 hover:opacity-100 hover:border-gray-500 dark:hover:border-gray-700"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                                        isEnabled ? method.color : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                                    )}>
                                        <method.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={cn("font-bold text-sm", isEnabled ? "text-gray-900 dark:text-white" : "text-gray-500")}>
                                            {method.label}
                                        </span>
                                        {isEnabled && <Check className="w-3 h-3 text-indigo-500" />}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Invoice Settings */}
                <div>
                    <SectionTitle title="Facturación" description="Personaliza la numeración de tus tickets." />
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-400 dark:border-gray-700 shadow-md flex items-center gap-6">
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400">
                            <Receipt className="w-8 h-8" />
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block uppercase tracking-wider">Prefijo</label>
                                <input
                                    type="text"
                                    value={settings.invoice?.prefix || 'FAC-'}
                                    onChange={(e) => setSettings({ ...settings, invoice: { ...settings.invoice, prefix: e.target.value } })}
                                    className="form-input text-center font-mono font-bold uppercase"
                                    placeholder="FAC-"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block uppercase tracking-wider">Próximo No.</label>
                                <input
                                    type="number"
                                    value={settings.invoice?.nextNumber || 1}
                                    onChange={(e) => setSettings({ ...settings, invoice: { ...settings.invoice, nextNumber: Number(e.target.value) } })}
                                    className="form-input text-center font-mono font-bold"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: POS Behavior */}
            <div className="space-y-8">
                <div>
                    <SectionTitle title="Experiencia POS" description="Optimiza el flujo de venta." />
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-400 dark:border-gray-700 shadow-md divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">

                        {/* Auto Confirm */}
                        <div className="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                    <Check className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">Confirmación Rápida</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Omitir vista previa tras cobrar</p>
                                </div>
                            </div>
                            <Switch
                                checked={settings.pos?.autoConfirm ?? false}
                                onChange={(c) => setSettings({ ...settings, pos: { ...settings.pos, autoConfirm: c } })}
                            />
                        </div>

                        {/* Change Calc */}
                        <div className="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                                    <Calculator className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">Calculadora de Vuelto</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Mostrar cambio a entregar</p>
                                </div>
                            </div>
                            <Switch
                                checked={settings.pos?.showChangeCalculation ?? true}
                                onChange={(c) => setSettings({ ...settings, pos: { ...settings.pos, showChangeCalculation: c } })}
                            />
                        </div>

                        {/* Negative Stock */}
                        <div className="p-5 flex items-center justify-between hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">Stock Negativo</h4>
                                    <p className="text-xs text-red-500/80 dark:text-red-400/80">Permitir venta sin existencias</p>
                                </div>
                            </div>
                            <Switch
                                checked={settings.pos?.allowNegativeStock ?? false}
                                onChange={(c) => setSettings({ ...settings, pos: { ...settings.pos, allowNegativeStock: c } })}
                            />
                        </div>
                    </div>
                </div>

                {/* Extras */}
                <div>
                    <SectionTitle title="Funciones Adicionales" />
                    <div className="grid grid-cols-1 gap-4">
                        {/* Discounts */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-400 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                                    <Percent className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-sm text-gray-700 dark:text-gray-200">Descuentos Manuales</span>
                            </div>
                            <Switch checked={settings.enableDiscounts} onChange={(c) => setSettings({ ...settings, enableDiscounts: c })} />
                        </div>

                        {/* Customer Required */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-400 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                                    <User className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-sm text-gray-700 dark:text-gray-200">Cliente Obligatorio</span>
                            </div>
                            <Switch checked={settings.requireCustomerName} onChange={(c) => setSettings({ ...settings, requireCustomerName: c })} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function InventoryTab({ settings, setSettings }: SettingsTabProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left Column: Settings */}
            <div className="space-y-8">
                <div>
                    <SectionTitle title="Control de Inventario" description="Configura las alertas y límites de tus existencias." />

                    {/* Low Stock Setting */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-400 dark:border-gray-700 shadow-md transition-all hover:shadow-lg">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-lg">Límite de Stock Bajo</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Define la cantidad mínima para generar alertas.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-400 dark:border-gray-700">
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    value={settings.inventory?.lowStockThreshold ?? 5}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        inventory: { ...settings.inventory, lowStockThreshold: Number(e.target.value) }
                                    })}
                                    className="w-24 h-12 text-center text-2xl font-black bg-white dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-indigo-500 focus:ring-0 outline-none shadow-sm dark:text-white transition-all"
                                />
                            </div>
                            <div className="flex-1">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 block">Unidades Mínimas</span>
                                <span className="text-xs text-gray-400">Se mostrará una alerta cuando el producto tenga esta cantidad o menos.</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visual Alerts Toggle */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-400 dark:border-gray-700 shadow-md flex items-center justify-between hover:border-teal-500/30 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-teal-50 dark:bg-teal-900/30 rounded-xl text-teal-600 dark:text-teal-400">
                            <Palette className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">Alertas Visuales</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Resaltar productos críticos en rojo</p>
                        </div>
                    </div>
                    <Switch
                        checked={settings.inventory?.showVisualAlerts ?? true}
                        onChange={(c) => setSettings({
                            ...settings,
                            inventory: { ...settings.inventory, showVisualAlerts: c }
                        })}
                    />
                </div>
            </div>

            {/* Right Column: Preview / Info */}
            <div className="space-y-6">
                <SectionTitle title="Vista Previa" />

                {/* Mock Card Preview */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-8 border-2 border-dashed border-gray-400 dark:border-gray-700 flex flex-col items-center justify-center text-center relative group">
                    <div className="absolute top-4 right-4 text-xs font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">Ejemplo</div>

                    <div className={cn(
                        "bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border w-full max-w-sm mb-6 relative overflow-hidden transition-all duration-300",
                        (settings.inventory?.showVisualAlerts && (settings.inventory?.lowStockThreshold > 2))
                            ? "border-red-200 dark:border-red-900/50 shadow-red-500/10"
                            : "border-gray-100 dark:border-gray-700"
                    )}>
                        {/* Status Bar */}
                        {(settings.inventory?.showVisualAlerts ?? true) && (settings.inventory?.lowStockThreshold > 2) && (
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
                        )}

                        <div className="flex items-center gap-4 pl-3">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                            </div>
                            <div className="text-left flex-1">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                                <div className="flex justify-between items-center">
                                    <span className={cn(
                                        "text-xs font-bold",
                                        (settings.inventory?.showVisualAlerts ?? true) && (settings.inventory?.lowStockThreshold > 2)
                                            ? "text-red-500"
                                            : "text-gray-400"
                                    )}>
                                        Stock: 2 unidades
                                    </span>
                                    <span className="text-xs text-gray-400">Q150.00</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 max-w-xs">
                        {settings.inventory?.showVisualAlerts
                            ? "Con las alertas activas, tus productos críticos se destacarán visualmente."
                            : "Las alertas visuales están desactivadas. El inventario se verá uniforme."}
                    </p>
                </div>

                {/* Categories Teaser */}
                <div className="opacity-75 grayscale hover:grayscale-0 transition-all duration-500 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-300 dark:border-gray-700 relative overflow-hidden">
                    <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black uppercase tracking-wider rounded-full">Próximamente</span>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl w-fit text-purple-600 dark:text-purple-300 mb-4">
                        <Database className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">Gestión Avanzada de Categorías</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Pronto podrás administrar tallas, colores y categorías globales de forma centralizada.
                    </p>
                </div>
            </div>
        </div>
    )
}


interface BackupsTabProps extends SettingsTabProps {
    onOpenWizard: () => void
    onOpenRestoreWizard: () => void
}

function BackupsTab({ settings, setSettings, onOpenWizard, onOpenRestoreWizard }: BackupsTabProps) {
    return (
        <div className="max-w-4xl mx-auto py-4 space-y-8">
            {/* Header Section */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Respaldo y Recuperación</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-lg mx-auto">
                    Protege la información de tu negocio. Tus datos son 100% locales y privados.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Create Backup Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-400 dark:border-gray-700 shadow-md hover:shadow-lg transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-full translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-500" />

                    <div className="relative z-10 h-full flex flex-col">
                        <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400">
                            <Database className="w-7 h-7" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Crear Copia de Seguridad</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 flex-1">
                            Descarga un archivo seguro con todo tu inventario, ventas y configuración actual.
                        </p>

                        <button
                            onClick={onOpenWizard}
                            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Download className="w-5 h-5" />
                            Generar Backup Nuevo
                        </button>
                    </div>
                </div>

                {/* Restore Backup Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-400 dark:border-gray-700 shadow-md hover:shadow-lg transition-all relative group">
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400">
                            <Upload className="w-7 h-7" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Restaurar Datos</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 flex-1">
                            Sube un archivo de respaldo completo y recupera tu información anterior.
                        </p>

                        <button
                            onClick={onOpenRestoreWizard}
                            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Upload className="w-5 h-5" />
                            Iniciar Restauración
                        </button>
                    </div>
                </div>
            </div>

            {/* Automation & Settings Row */}
            <div className="bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-6 border border-gray-300 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 text-left w-full md:w-auto">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shrink-0">
                        <RefreshCw className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Respaldos Automáticos</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Guarda una copia local periódicamente.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-2 pl-4 rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm w-full md:w-auto justify-between md:justify-start">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        Frecuencia:
                    </span>
                    <select
                        value={settings.backup?.frequency ?? 'weekly'}
                        onChange={(e) => setSettings({
                            ...settings,
                            backup: { ...settings.backup, frequency: e.target.value as 'daily' | 'weekly' }
                        })}
                        disabled={!settings.backup?.autoBackup}
                        className="bg-transparent border-none text-sm font-bold text-indigo-600 focus:ring-0 cursor-pointer disabled:text-gray-400 p-0 pl-1"
                    >
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                    </select>
                    <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-700 mx-2"></div>
                    <Switch
                        checked={settings.backup?.autoBackup ?? false}
                        onChange={(c) => setSettings({
                            ...settings,
                            backup: { ...settings.backup, autoBackup: c }
                        })}
                    />
                </div>
            </div>

            {/* Warning Note */}
            <div className="flex gap-4 p-4 bg-amber-50 dark:bg-amber-900/10 text-amber-800 dark:text-amber-200 rounded-xl border border-amber-200 dark:border-amber-800/30 items-start">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">
                    <span className="font-bold block mb-1">Importante sobre la restauración:</span>
                    Al restaurar una copia de seguridad, todos los datos actuales serán reemplazados por los del archivo y la app se reiniciará.
                </p>
            </div>
        </div>
    )
}

function AppearanceTab({ settings, setSettings }: SettingsTabProps) {
    return (
        <div className="max-w-4xl mx-auto py-6">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Personaliza tu Experiencia</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                    Elige el aspecto que mejor se adapte a tu entorno y flujo de trabajo.
                </p>
            </div>

            {/* Theme Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                    {
                        id: 'light',
                        label: 'Claro',
                        desc: 'Limpio y nítido',
                        icon: Sun,
                        activeClass: 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/10'
                    },
                    {
                        id: 'dark',
                        label: 'Oscuro',
                        desc: 'Cómodo para la vista',
                        icon: Moon,
                        activeClass: 'ring-2 ring-indigo-500 bg-gray-800'
                    },
                    {
                        id: 'system',
                        label: 'Automático',
                        desc: 'Sincronizado con tu PC',
                        icon: Monitor,
                        activeClass: 'ring-2 ring-indigo-500 bg-gray-50 dark:bg-gray-800'
                    }
                ].map((mode) => {
                    const isActive = settings.theme?.mode === mode.id
                    return (
                        <button
                            key={mode.id}
                            onClick={() => {
                                const newMode = mode.id as 'light' | 'dark' | 'system'
                                setSettings({ ...settings, theme: { ...settings.theme, mode: newMode } })
                                companyService.applyTheme(newMode)
                            }}
                            className={cn(
                                "relative p-6 rounded-2xl border transition-all duration-300 group hover:shadow-lg text-left overflow-hidden",
                                isActive
                                    ? mode.activeClass + " border-transparent shadow-md"
                                    : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600"
                            )}
                        >
                            {isActive && (
                                <div className="absolute top-4 right-4 text-indigo-500 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm">
                                    <Check className="w-4 h-4" />
                                </div>
                            )}

                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                                isActive ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:scale-110"
                            )}>
                                <mode.icon className="w-6 h-6" />
                            </div>

                            <h3 className={cn("text-lg font-bold mb-1", isActive ? "text-indigo-900 dark:text-white" : "text-gray-900 dark:text-white")}>
                                {mode.label}
                            </h3>
                            <p className={cn("text-sm", isActive ? "text-indigo-700/80 dark:text-gray-300" : "text-gray-500 dark:text-gray-400")}>
                                {mode.desc}
                            </p>
                        </button>
                    )
                })}
            </div>

            {/* Density Selection */}
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-6 opacity-80">
                    <div className="h-[1px] w-12 bg-gray-200 dark:bg-gray-700"></div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Densidad</span>
                    <div className="h-[1px] w-12 bg-gray-200 dark:bg-gray-700"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={() => setSettings({ ...settings, theme: { ...settings.theme, density: 'normal' } })}
                        className={cn(
                            "group p-4 rounded-xl border text-left flex items-center gap-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50",
                            settings.theme?.density === 'normal'
                                ? "border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10"
                                : "border-gray-300 dark:border-gray-700"
                        )}
                    >
                        <div className="space-y-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700 shadow-sm w-16 opacity-75 group-hover:opacity-100 transition-opacity">
                            <div className="h-2 w-full bg-gray-200 dark:bg-gray-600 rounded"></div>
                            <div className="h-2 w-2/3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                            <div className="h-2 w-full bg-gray-200 dark:bg-gray-600 rounded"></div>
                        </div>
                        <div>
                            <span className={cn("block font-bold", settings.theme?.density === 'normal' ? "text-indigo-700 dark:text-indigo-300" : "text-gray-700 dark:text-gray-200")}>Normal</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Espaciado cómodo y legible.</span>
                        </div>
                    </button>

                    <button
                        onClick={() => setSettings({ ...settings, theme: { ...settings.theme, density: 'compact' } })}
                        className={cn(
                            "group p-4 rounded-xl border text-left flex items-center gap-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50",
                            settings.theme?.density === 'compact'
                                ? "border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10"
                                : "border-gray-300 dark:border-gray-700"
                        )}
                    >
                        <div className="space-y-1 p-2 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700 shadow-sm w-16 opacity-75 group-hover:opacity-100 transition-opacity">
                            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-600 rounded"></div>
                            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-600 rounded"></div>
                            <div className="h-1.5 w-3/4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-600 rounded"></div>
                        </div>
                        <div>
                            <span className={cn("block font-bold", settings.theme?.density === 'compact' ? "text-indigo-700 dark:text-indigo-300" : "text-gray-700 dark:text-gray-200")}>Compacto</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Más información en menos espacio.</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}

function AboutTab() {
    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-xl relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 p-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50 blur-3xl" />
                <div className="absolute bottom-0 left-0 p-40 bg-teal-50 dark:bg-teal-900/10 rounded-full -translate-x-1/3 translate-y-1/3 opacity-50 blur-3xl" />

                <div className="relative z-10">
                    {/* App Logo/Icon */}
                    <div className="mb-8 relative inline-block group">
                        <div className="relative p-6 bg-white dark:bg-gray-700/30 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-600 backdrop-blur-sm transform group-hover:scale-105 transition-all duration-500">
                            <img
                                src="/icono-black.png"
                                alt="CeroCloud Logo"
                                className="w-32 h-32 object-contain"
                            />
                        </div>
                        <div className="absolute -inset-4 bg-indigo-500/10 rounded-full blur-xl -z-10 group-hover:bg-indigo-500/20 transition-colors" />
                    </div>

                    <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                        CeroCloud
                    </h2>
                    <p className="text-indigo-600 dark:text-indigo-400 font-bold mb-8">
                        Versión 1.0.1 (Stable Release)
                    </p>

                    <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
                        Una solución de punto de venta e inventario diseñada para empoderar a pequeños negocios.
                        Opera 100% offline, sin costos ocultos y con total privacidad de tus datos.
                        Simplifica tu administración y enfócate en crecer.
                    </p>

                    {/* Social Media Links */}
                    <div className="flex justify-center gap-4 mb-12">
                        <a
                            href="https://github.com/CeroCloud/CeroCloud-Desktop"
                            className="flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all hover:-translate-y-1 hover:shadow-lg"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Github className="w-5 h-5" />
                            <span className="font-medium">Repositorio GitHub</span>
                        </a>

                        <a
                            href="https://github.com/CeroCloud/CeroCloud-Desktop/issues"
                            className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all hover:-translate-y-1 hover:shadow-lg"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <MessageSquare className="w-5 h-5 text-indigo-500" />
                            <span className="font-medium">Soporte / Issues</span>
                        </a>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700 pt-8 flex flex-wrap justify-center gap-6">
                        <button
                            onClick={() => alert('MIT + Commons Clause - Código abierto sin venta comercial. Ver LICENSE para detalles.')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-sm font-medium transition-colors"
                        >
                            <FileText className="w-4 h-4" /> Licencia de Uso
                        </button>
                        <button
                            onClick={() => alert('Tus datos son 100% locales y privados. CeroCloud no envía información a servidores externos.')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-sm font-medium transition-colors"
                        >
                            <Shield className="w-4 h-4" /> Política de Privacidad
                        </button>
                    </div>
                </div>
            </div>

            <p className="text-center text-gray-400 text-sm mt-8">
                &copy; 2025 CeroCloud. Todos los derechos reservados.<br />
                <span className="opacity-50">Programado con ❤️ por el equipo de CeroCloud.</span>
            </p>
        </div>
    )
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={cn(
                "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2",
                checked ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
            )}
        >
            <span
                className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    checked ? "translate-x-5" : "translate-x-0"
                )}
            />
        </button>
    )
}

function UpdatesTab() {
    const [currentVersion, setCurrentVersion] = useState<string>('Cargando...')
    const [checking, setChecking] = useState(false)
    const [updateAvailable, setUpdateAvailable] = useState<UpdateInfo | null>(null)
    const [autoCheckEnabled, setAutoCheckEnabled] = useState(true)

    useEffect(() => {
        // Obtener versión actual
        if (window.electronAPI?.updater) {
            window.electronAPI.updater.getCurrentVersion().then(v => {
                setCurrentVersion(v)
            }).catch(() => {
                setCurrentVersion('1.0.0')
            })
        } else {
            setCurrentVersion('1.0.0 (Dev)')
        }
    }, [])

    const handleCheckUpdates = async () => {
        if (!window.electronAPI?.updater) {
            toast.info('Auto-updater no disponible en modo desarrollo')
            return
        }

        setChecking(true)
        setUpdateAvailable(null)

        toast.loading('Verificando actualizaciones...', { id: 'check-update' })

        try {
            const result = await window.electronAPI.updater.checkForUpdates()

            if (result.success && result.data?.updateInfo?.version) {
                setUpdateAvailable(result.data.updateInfo)
                toast.success(`¡Nueva versión ${result.data.updateInfo.version} disponible!`, {
                    id: 'check-update',
                })
            } else {
                toast.success('Ya estás en la última versión', {
                    id: 'check-update',
                })
            }
        } catch (error) {
            toast.error(`Error: ${error instanceof Error ? error.message : String(error)}`, {
                id: 'check-update',
            })
        } finally {
            setChecking(false)
        }
    }

    const handleToggleAutoCheck = async () => {
        if (!window.electronAPI?.updater) return

        const newValue = !autoCheckEnabled
        setAutoCheckEnabled(newValue)

        try {
            await window.electronAPI.updater.setAutoCheck(newValue, 6)
            toast.success(newValue ? 'Verificación automática activada' : 'Verificación automática desactivada')
        } catch (error) {
            console.error('Error al cambiar auto-check:', error)
        }
    }

    const handleDownloadUpdate = async () => {
        if (!window.electronAPI?.updater || !updateAvailable) return

        toast.loading('Iniciando descarga...', { id: 'download-update' })

        try {
            await window.electronAPI.updater.downloadUpdate()
            toast.dismiss('download-update')
        } catch (error) {
            toast.error(`Error al descargar: ${error instanceof Error ? error.message : String(error)}`, {
                id: 'download-update',
            })
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-4 space-y-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                    Actualizaciones de Software
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-lg mx-auto">
                    Mantén CeroCloud actualizado para acceder a las últimas funcionalidades y mejoras de seguridad.
                </p>
            </div>

            {/* Current Version Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-indigo-100 text-sm font-semibold mb-2">VERSIÓN ACTUAL</p>
                            <h3 className="text-4xl font-black">v{currentVersion}</h3>
                        </div>
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <Package className="w-8 h-8" />
                        </div>
                    </div>

                    {updateAvailable ? (
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold mb-1">🎉 Nueva versión disponible</p>
                                    <p className="text-indigo-100 text-sm">
                                        v{updateAvailable.version} • {updateAvailable.releaseDate ? new Date(updateAvailable.releaseDate).toLocaleDateString() : 'Fecha desconocida'}
                                    </p>
                                </div>
                                <button
                                    onClick={handleDownloadUpdate}
                                    className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Descargar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-indigo-100 text-sm">
                            {checking ? 'Verificando...' : 'Estás usando la última versión estable'}
                        </p>
                    )}
                </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Manual Check */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-300 dark:border-gray-700 shadow-md hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <RefreshCw className="w-6 h-6" />
                        </div>
                    </div>

                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Verificar Ahora</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Comprueba manualmente si hay nuevas versiones disponibles.
                    </p>

                    <button
                        onClick={handleCheckUpdates}
                        disabled={checking || !window.electronAPI?.updater}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                    >
                        {checking ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Verificando...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                Buscar Actualizaciones
                            </>
                        )}
                    </button>
                </div>

                {/* Auto Updates */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-300 dark:border-gray-700 shadow-md">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
                            <Shield className="w-6 h-6" />
                        </div>
                        <Switch checked={autoCheckEnabled} onChange={handleToggleAutoCheck} />
                    </div>

                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Auto-actualizaciones</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        {autoCheckEnabled
                            ? 'CeroCloud verifica nuevas versiones cada 6 horas automáticamente.'
                            : 'Las verificaciones automáticas están desactivadas. Tendrás que buscar actualizaciones manualmente.'}
                    </p>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <Check className="w-5 h-5 text-green-500" />
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">Seguro</h4>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Verificación de checksums y firma digital
                    </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <Download className="w-5 h-5 text-blue-500" />
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">Descarga Silenciosa</h4>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Sin interrumpir tu trabajo
                    </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <Github className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">GitHub Releases</h4>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Fuente oficial y confiable
                    </p>
                </div>
            </div>

            {/* Notice */}
            {!window.electronAPI?.updater && (
                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-yellow-900 dark:text-yellow-200 text-sm mb-1">
                                Modo Desarrollo
                            </h4>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                El auto-updater solo funciona en versiones empaquetadas (builds). En modo desarrollo, esta funcionalidad está deshabilitada.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Changelog Link */}
            <div className="text-center">
                <a
                    href="https://cerocloud.github.io/CeroCloud-website/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold text-sm transition-colors"
                >
                    <FileText className="w-4 h-4" />
                    Ver historial de versiones completo
                </a>
            </div>
        </div>
    )
}
