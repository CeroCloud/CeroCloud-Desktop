
import { CompanySettings } from '@/types/database'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import {
    Shield,
    Monitor,
    Package,
    Palette,
    Database,
    AlertTriangle
} from 'lucide-react'

interface InventoryTabProps {
    settings: CompanySettings
    setSettings: (settings: CompanySettings) => void
}

export function InventoryTab({ settings, setSettings }: InventoryTabProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="text-left">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Automatización de Inventario</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">Configura cuándo y cómo quieres recibir alertas de stock bajo.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Column: Configuration */}
                <div className="space-y-6">

                    {/* Critical Limit Card (Horizontal) */}
                    <div className="relative group overflow-hidden rounded-[2rem] p-6 bg-white dark:bg-indigo-950 border border-gray-100 dark:border-indigo-900/50 shadow-sm dark:shadow-xl transition-all">
                        <div className="absolute inset-0 bg-indigo-50/50 dark:bg-gradient-to-r dark:from-indigo-500/20 dark:to-purple-500/20 dark:mix-blend-overlay"></div>
                        <div className="relative z-10 flex items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-100 dark:bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm shrink-0">
                                    <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Límite Crítico</h3>
                                    <p className="text-gray-500 dark:text-indigo-200/70 text-xs max-w-[150px]">Alerta global de bajo stock</p>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    value={settings.inventory?.lowStockThreshold ?? 5}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        inventory: { ...settings.inventory, lowStockThreshold: Number(e.target.value) }
                                    })}
                                    className="w-20 bg-transparent border-b-2 border-indigo-500/30 dark:border-indigo-400/50 focus:border-indigo-500 dark:focus:border-white text-4xl font-black text-center focus:outline-none transition-colors text-gray-900 dark:text-white"
                                />
                                <span className="text-xs font-bold text-gray-400 dark:text-indigo-300 uppercase tracking-widest">Unds.</span>
                            </div>
                        </div>
                    </div>

                    {/* Visual Alerts Toggle */}
                    <div className="bg-white dark:bg-slate-800/40 rounded-[2rem] p-6 border border-gray-100 dark:border-slate-700/50 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl text-teal-600 dark:text-teal-400">
                                <Palette className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Alertas Visuales</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Resaltar filas en rojo
                                </p>
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

                    {/* More Options Placeholder (Compact) */}
                    <div className="bg-gray-50 dark:bg-slate-800/20 rounded-[2rem] p-4 border-2 border-dashed border-gray-100 dark:border-slate-800 flex items-center justify-center text-center opacity-70 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-gray-300 dark:text-slate-600" />
                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Más opciones próximamente</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Live Preview */}
                <div className="bg-white dark:bg-slate-800/40 rounded-[2rem] p-8 border border-gray-100 dark:border-slate-700/50 shadow-sm flex flex-col justify-center h-full">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-8 uppercase tracking-wider">
                        <Monitor className="w-4 h-4 text-gray-400" />
                        Vista Previa
                    </h3>

                    <div className="flex flex-col justify-center gap-6">
                        {/* Mock Product Row */}
                        <div className={cn(
                            "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 transform scale-105 origin-center",
                            (settings.inventory?.showVisualAlerts && (settings.inventory?.lowStockThreshold > 2))
                                ? "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 shadow-sm"
                                : "bg-gray-50 dark:bg-slate-900/50 border-gray-100 dark:border-slate-800"
                        )}>
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                    (settings.inventory?.showVisualAlerts && (settings.inventory?.lowStockThreshold > 2))
                                        ? "bg-white dark:bg-white/10 text-red-500"
                                        : "bg-white dark:bg-slate-800 text-gray-400"
                                )}>
                                    <Package className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-base font-bold text-gray-900 dark:text-white">Producto Ejemplo</div>
                                    <div className="text-xs text-gray-400 font-medium">REF-001</div>
                                </div>
                            </div>
                            <span className={cn(
                                "text-xs font-bold px-3 py-1.5 rounded-lg transition-colors",
                                (settings.inventory?.showVisualAlerts && (settings.inventory?.lowStockThreshold > 2))
                                    ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
                                    : "bg-gray-200 text-gray-600 dark:bg-slate-700 dark:text-gray-400"
                            )}>
                                2 Unidades
                            </span>
                        </div>

                        <div className="h-4 flex items-center justify-center gap-2 text-xs text-center transition-all duration-300">
                            {(settings.inventory?.showVisualAlerts && (settings.inventory?.lowStockThreshold > 2)) ? (
                                <>
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="text-gray-500 dark:text-slate-400">El sistema resaltará el producto por bajo stock.</span>
                                </>
                            ) : (
                                <span className="text-gray-400 dark:text-slate-500">El producto se verá normal.</span>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
