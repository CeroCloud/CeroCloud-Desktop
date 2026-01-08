/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import {
    Download,
    TrendingUp,
    Package,
    DollarSign,
    Calendar,
    AlertCircle,
    Activity,
    X
} from 'lucide-react'
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'
import { productService } from '@/services/productService'
import { saleService } from '@/services/saleService'
import { pdfGenerator } from '@/services/pdfGenerator'
import { companyService } from '@/services/companyService'
import { Product, Sale } from '@/types/database'
import { format, subDays, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export function Reports() {
    const [products, setProducts] = useState<Product[]>([])
    const [sales, setSales] = useState<Sale[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'export' | 'transactions'>('sales')
    const [settings] = useState(companyService.getSettings())

    // UI States
    const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [productsData, salesData] = await Promise.all([
                productService.getAll(),
                saleService.getAll()
            ])
            setProducts(productsData)
            setSales(salesData)
        } catch (error) {
            console.error('Error loading data:', error)
            toast.error('Error cargando reportes')
        } finally {
            setLoading(false)
        }
    }

    // --- METRICS CALCULATION ---
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0)
    const salesToday = sales.filter(sale => {
        const today = new Date().toDateString()
        const saleDate = new Date(sale.created_at!).toDateString()
        return today === saleDate
    })
    const totalSalesToday = salesToday.reduce((sum, sale) => sum + sale.total, 0)

    const lowStockProducts = products.filter(p => p.stock <= Math.max(p.min_stock, settings.inventory?.lowStockThreshold || 0))
    const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)

    // Chart Data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i)
        const dayStart = startOfDay(date)
        const daySales = sales.filter(sale => {
            const saleDate = startOfDay(new Date(sale.created_at!))
            return saleDate.getTime() === dayStart.getTime()
        })
        return {
            date: format(date, 'dd MMM', { locale: es }),
            ventas: daySales.reduce((sum, sale) => sum + sale.total, 0),
            cantidad: daySales.length
        }
    })

    const hourlyTraffic = Array.from({ length: 15 }, (_, i) => {
        const hour = i + 8 // Start from 8 AM
        return {
            hour: `${hour}:00`,
            sales: 0,
            count: 0
        }
    })

    sales.forEach(sale => {
        if (sale.created_at) {
            const saleDate = new Date(sale.created_at)
            const hour = saleDate.getHours()
            if (hour >= 8 && hour <= 22) {
                hourlyTraffic[hour - 8].sales += sale.total
                hourlyTraffic[hour - 8].count += 1
            }
        }
    })

    // --- HANDLERS ---

    const handleCancelSale = async () => {
        if (!saleToCancel) return

        try {
            await window.electronAPI.sales.cancel(saleToCancel.id!)
            toast.success('Venta cancelada', { description: 'El stock ha sido restaurado correctamente.' })
            setSaleToCancel(null)
            loadData() // Refresh data
        } catch (error) {
            console.error(error)
            toast.error('Error al cancelar venta')
        }
    }

    const productRevenue = new Map<number, { product: Product; revenue: number; quantity: number }>()
    sales.forEach(sale => {
        sale.items.forEach(item => {
            const current = productRevenue.get(item.product_id) || {
                product: products.find(p => p.id === item.product_id)!,
                revenue: 0,
                quantity: 0
            }
            if (current.product) {
                productRevenue.set(item.product_id, {
                    product: current.product,
                    revenue: current.revenue + item.subtotal,
                    quantity: current.quantity + item.quantity
                })
            }
        })
    })

    const topProducts = Array.from(productRevenue.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map(item => ({
            name: item.product.name.length > 15 ? item.product.name.substring(0, 15) + '...' : item.product.name,
            ventas: item.revenue,
            cantidad: item.quantity
        }))

    const COLORS = ['#3b82f6', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6']

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium">Analizando datos...</p>
                </div>
            </div>
        )
    }

    const tabs = [
        { id: 'sales', label: 'Ventas', icon: DollarSign },
        { id: 'inventory', label: 'Inventario', icon: Package },
        { id: 'transactions', label: 'Transacciones', icon: Calendar },
        { id: 'export', label: 'Exportar', icon: Download },
    ]

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Reportes</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Análisis detallado de tu negocio</p>
                </div>

                {/* Modern Tabs */}
                <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'sales' && (
                        <div className="space-y-6">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <MetricCard
                                    title="Ventas de Hoy"
                                    value={`${settings.currencySymbol}${totalSalesToday.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                                    subtitle={`${salesToday.length} transacciones`}
                                    icon={DollarSign}
                                    color="green"
                                />
                                <MetricCard
                                    title="Ventas Totales"
                                    value={`${settings.currencySymbol}${totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                                    subtitle="Histórico acumulado"
                                    icon={TrendingUp}
                                    color="blue"
                                />
                                <MetricCard
                                    title="Ticket Promedio"
                                    value={`${settings.currencySymbol}${sales.length > 0 ? (totalSales / sales.length).toFixed(2) : '0.00'}`}
                                    subtitle="Por venta realizada"
                                    icon={Activity}
                                    color="purple"
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-300 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Tendencia (7 días)</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={last7Days}>
                                            <defs>
                                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => `${settings.currencySymbol}${value}`} />
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Area type="monotone" dataKey="ventas" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-300 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Horas Pico de Actividad</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={hourlyTraffic} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis
                                                dataKey="hour"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#6B7280', fontSize: 11 }}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#6B7280', fontSize: 11 }}
                                                tickFormatter={(value) => `${settings.currencySymbol}${value}`}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                formatter={(value: any, name: string | number | undefined) => [
                                                    name === 'sales' ? `${settings.currencySymbol}${Number(value).toLocaleString()}` : value,
                                                    name === 'sales' ? 'Ventas Generadas' : 'Transacciones'
                                                ]}
                                            />
                                            <Bar
                                                dataKey="sales"
                                                fill="#8b5cf6"
                                                radius={[4, 4, 0, 0]}
                                                barSize={20}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Top Products Section */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-300 dark:border-gray-700 mt-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Top 5 Productos Más Vendidos</h3>
                                <div className="space-y-5">
                                    {topProducts.map((product, index) => (
                                        <div key={index} className="relative">
                                            <div className="flex justify-between items-end mb-1">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[200px]">
                                                    {index + 1}. {product.name}
                                                </span>
                                                <div className="text-right flex items-center gap-3">
                                                    <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md">
                                                        {product.cantidad} un.
                                                    </span>
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {settings.currencySymbol}{product.ventas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500 ease-out"
                                                    style={{
                                                        width: `${(product.ventas / (topProducts[0]?.ventas || 1)) * 100}%`,
                                                        backgroundColor: COLORS[index % COLORS.length]
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {topProducts.length === 0 && (
                                        <div className="text-center py-10 text-gray-400 text-sm">
                                            No hay suficientes datos de ventas aún.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'inventory' && (
                        <div className="space-y-6">
                            {/* Key Metrics Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <MetricCard
                                    title="Total Productos"
                                    value={products.length.toString()}
                                    subtitle="En catálogo"
                                    icon={Package}
                                    color="blue"
                                />
                                <MetricCard
                                    title="Valor Inventario"
                                    value={`${settings.currencySymbol}${inventoryValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                                    subtitle="Costo total estimado"
                                    icon={DollarSign}
                                    color="green"
                                />
                                <MetricCard
                                    title="Stock Bajo"
                                    value={lowStockProducts.length.toString()}
                                    subtitle="Requieren reabastecimiento"
                                    icon={AlertCircle}
                                    color={lowStockProducts.length > 0 ? "red" : "gray"}
                                />
                            </div>

                            {/* Inventory Analysis Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Category Value Chart */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-300 dark:border-gray-700 flex flex-col justify-between">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Valor por Categoría</h3>
                                    <div className="h-[280px] w-full relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={Object.entries(products.reduce((acc, p) => {
                                                        const cat = p.category || 'Sin Categoría'
                                                        acc[cat] = (acc[cat] || 0) + (p.price * p.stock)
                                                        return acc
                                                    }, {} as Record<string, number>))
                                                        .map(([name, value]) => ({ name, value }))
                                                        .sort((a, b) => b.value - a.value)}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={85} // Reduced from 100 to prevent legend overlap
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {products.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value: any) => `${settings.currencySymbol}${value.toLocaleString()}`} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        {/* Legend positioned inside chart area but safe */}
                                        <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-3 pb-2">
                                            {Object.keys(products.reduce((acc, p) => {
                                                const cat = p.category || 'Sin Categoría'
                                                acc[cat] = true
                                                return acc
                                            }, {} as Record<string, boolean>)).slice(0, 5).map((cat, index) => (
                                                <div key={cat} className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-full border border-gray-100 dark:border-gray-700">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                    <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300 truncate max-w-[100px]">{cat}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Top Value Products List */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-300 dark:border-gray-700 flex flex-col">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Mayor Inversión (Top 5)</h3>
                                    <div className="flex-grow space-y-4 overflow-y-auto">
                                        {products
                                            .map(p => ({ ...p, totalValue: p.price * p.stock }))
                                            .sort((a, b) => b.totalValue - a.totalValue)
                                            .slice(0, 5)
                                            .map((product, i) => (
                                                <div key={product.id} className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex items-center justify-center w-6 h-6 rounded bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-500">
                                                            {i + 1}
                                                        </span>
                                                        <div>
                                                            <p className="font-medium text-sm text-gray-900 dark:text-white truncate max-w-[180px]">{product.name}</p>
                                                            <p className="text-xs text-gray-500">{product.stock} unidades</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                                                            {settings.currencySymbol}{(product.price * product.stock).toLocaleString()}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400">Total valor</p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Valor Promedio por Item</span>
                                            <span className="font-mono font-bold text-gray-700 dark:text-gray-300">
                                                {products.length > 0
                                                    ? `${settings.currencySymbol}${(inventoryValue / products.length).toFixed(2)}`
                                                    : `${settings.currencySymbol}0.00`
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stock Alerts (Existing but refreshed) */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-300 dark:border-gray-700 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <AlertCircle className={cn("w-5 h-5", lowStockProducts.length > 0 ? "text-red-500" : "text-green-500")} />
                                        {lowStockProducts.length > 0 ? "Alertas de Stock" : "Inventario Saludable"}
                                    </h3>
                                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold", lowStockProducts.length > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600")}>
                                        {lowStockProducts.length} productos
                                    </span>
                                </div>
                                {lowStockProducts.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Producto</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stock Actual</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {lowStockProducts.map(p => (
                                                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{p.name}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="font-bold text-red-600">{p.stock}</span>
                                                            <span className="text-gray-400 text-xs ml-2">/ min {Math.max(p.min_stock, settings.inventory?.lowStockThreshold || 0)}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="w-full max-w-[100px] h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-red-500 rounded-full"
                                                                    style={{ width: `${Math.min(100, (p.stock / p.min_stock) * 100)}%` }}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-12 text-center">
                                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Package className="w-8 h-8 text-green-500" />
                                        </div>
                                        <h4 className="text-gray-900 font-bold mb-1">¡Todo en orden!</h4>
                                        <p className="text-gray-500 text-sm">No hay productos con stock bajo en este momento.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'export' && (
                        <ExportSection sales={sales} products={products} settings={settings} />
                    )}

                    {activeTab === 'transactions' && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-300 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 dark:text-white">Historial de Transacciones</h3>
                                <span className="text-xs text-gray-500">Últimas 50 ventas</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID / Fecha</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Items</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {sales.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 50).map((sale) => (
                                            <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900 dark:text-white">#{sale.id}</div>
                                                    <div className="text-xs text-gray-400">
                                                        {sale.created_at ? new Date(sale.created_at).toLocaleString() : '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {sale.customer_name || 'Público General'}
                                                    </div>
                                                    <div className="text-xs text-gray-400 capitalize">{sale.payment_method}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                                        {sale.items.length} productos
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900 dark:text-white">
                                                        {settings.currencySymbol}{sale.total.toFixed(2)}
                                                    </div>
                                                    {sale.status === 'cancelled' && (
                                                        <div className="text-xs text-red-500 font-medium">Cancelada</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => pdfGenerator.generateInvoice(sale, settings)}
                                                            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm flex items-center gap-1"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                            <span className="hidden sm:inline">Ticket</span>
                                                        </button>
                                                        {sale.status !== 'cancelled' && (
                                                            <button
                                                                onClick={() => setSaleToCancel(sale)}
                                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm flex items-center gap-1"
                                                            >
                                                                <X className="w-4 h-4" />
                                                                <span className="hidden sm:inline">Cancelar</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <ConfirmDialog
                isOpen={!!saleToCancel}
                onCancel={() => setSaleToCancel(null)}
                onConfirm={handleCancelSale}
                title={`Cancelar Venta #${saleToCancel?.id}`}
                description="¿Estás seguro de que deseas cancelar esta venta? Esta acción restaurará el stock de los productos vendidos y marcará la transacción como cancelada. Esta acción no se puede deshacer."
                confirmText="Sí, cancelar venta"
                cancelText="No, mantener"
                variant="danger"
            />
        </div>
    )
}

function MetricCard({ title, value, subtitle, icon: Icon, color }: any) {
    const colors = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
        green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
        purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
        red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
        gray: "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-300 dark:border-gray-700 flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{value}</h3>
                <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
            </div>
            <div className={cn("p-3 rounded-xl", colors[color as keyof typeof colors])}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    )
}

function ExportSection({ sales, products, settings }: { sales: Sale[]; products: Product[]; settings: any }) {
    const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('today')

    // Filter Logic
    const getFilteredSales = () => {
        const now = new Date()
        return sales.filter(sale => {
            if (!sale.created_at) return false
            const date = new Date(sale.created_at)

            if (timeRange === 'today') {
                return date.toDateString() === now.toDateString()
            }
            if (timeRange === 'week') {
                const weekAgo = subDays(now, 7)
                return date >= weekAgo
            }
            if (timeRange === 'month') {
                const monthAgo = subDays(now, 30)
                return date >= monthAgo
            }
            return true
        })
    }

    const filteredSales = getFilteredSales()
    // Products don't usually filter by date unless it's "created_at", but for inventory snapshots we usually want current state.
    // However, for "Low Stock" we just filter by logic. Used products remains full list usually.

    const lowStock = products.filter(p => p.stock <= Math.max(p.min_stock, settings.inventory?.lowStockThreshold || 0))

    const handleExport = (type: 'sales' | 'inventory' | 'low-stock' | 'daily-closing') => {
        const titleMap = {
            'sales': 'Reporte de Ventas',
            'inventory': 'Inventario Valorado',
            'low-stock': 'Alerta de Stock Bajo',
            'daily-closing': 'Cierre de Caja'
        }
        const subtitleMap = {
            'sales': 'Historial de Transacciones',
            'inventory': 'Catálogo Completo',
            'low-stock': 'Productos que requieren atención',
            'daily-closing': 'Resumen de Turno/Día'
        }

        let dataToExport: any[] = []
        const exportTitle = titleMap[type]

        if (type === 'sales') dataToExport = filteredSales
        if (type === 'daily-closing') {
            // Daily closing is specifically Today regardless of filter, or we can respect filter if user selects "Today" specifically? 
            // Usually Daily Closing implies Today. Let's force filter to today for this button or use current filter if it makes sense.
            // To be safe/explicit:
            dataToExport = sales.filter(s => new Date(s.created_at!).toDateString() === new Date().toDateString())
        }
        if (type === 'inventory') dataToExport = products
        if (type === 'low-stock') dataToExport = lowStock

        const rangeLabel = {
            'today': 'Hoy',
            'week': 'Última Semana',
            'month': 'Último Mes',
            'all': 'Histórico Completo'
        }[timeRange]

        toast.promise(
            pdfGenerator.generateReport(
                exportTitle,
                subtitleMap[type],
                dataToExport,
                type,
                settings,
                type === 'inventory' || type === 'low-stock' ? undefined : rangeLabel
            ),
            {
                loading: 'Generando PDF...',
                success: 'Reporte descargado correctamente',
                error: 'Error al generar reporte'
            }
        )
    }

    return (
        <div className="space-y-6">
            {/* Time Filter Controls */}
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-300 dark:border-gray-700">
                <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    Periodo del Reporte
                </span>
                <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl">
                    {(['today', 'week', 'month', 'all'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize",
                                timeRange === range
                                    ? "bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            )}
                        >
                            {range === 'today' ? 'Hoy' : range === 'week' ? 'Semana' : range === 'month' ? 'Mes' : 'Todo'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sales Report Card */}
                <NewExportCard
                    title="Reporte de Ventas"
                    description={`Generar reporte de ingresos y transacciones (${timeRange === 'today' ? 'Hoy' : timeRange === 'all' ? 'Histórico' : 'Periodo'}).`}
                    count={filteredSales.length}
                    total={filteredSales.reduce((s, x) => s + x.total, 0)}
                    currencySymbol={settings.currencySymbol}
                    icon={DollarSign}
                    color="green"
                    onClick={() => handleExport('sales')}
                    previewData={filteredSales.slice(0, 3).map(s => (
                        <div key={s.id} className="flex justify-between text-xs py-1 border-b border-dashed border-gray-100 dark:border-gray-700 last:border-0">
                            <span className="text-gray-500">#{s.id}</span>
                            <span className="font-medium text-gray-900 dark:text-white">{settings.currencySymbol}{s.total.toFixed(2)}</span>
                        </div>
                    ))}
                />

                {/* Inventory Card (Static snapshot) */}
                <NewExportCard
                    title="Inventario Valorado"
                    description="Reporte completo de existencias y valoración de almacén."
                    count={products.length}
                    total={products.reduce((s, p) => s + (p.price * p.stock), 0)}
                    currencySymbol={settings.currencySymbol}
                    icon={Package}
                    color="blue"
                    onClick={() => handleExport('inventory')}
                    previewData={products.slice(0, 3).map(p => (
                        <div key={p.id} className="flex justify-between text-xs py-1 border-b border-dashed border-gray-100 dark:border-gray-700 last:border-0">
                            <span className="truncate max-w-[150px] text-gray-500">{p.name}</span>
                            <span className="font-medium text-gray-900 dark:text-white">{p.stock} u.</span>
                        </div>
                    ))}
                />

                {/* Low Stock Card */}
                <NewExportCard
                    title="Alertas de Stock"
                    description="Productos por debajo del nivel mínimo configurado."
                    count={lowStock.length}
                    icon={AlertCircle}
                    color="red"
                    onClick={() => handleExport('low-stock')}
                    previewData={lowStock.length === 0 ? [<span key="ok" className="text-xs text-green-500">¡Todo en orden!</span>] : lowStock.slice(0, 3).map(p => (
                        <div key={p.id} className="flex justify-between text-xs py-1 border-b border-dashed border-gray-100 dark:border-gray-700 last:border-0">
                            <span className="text-red-500 truncate max-w-[150px]">{p.name}</span>
                            <span className="font-bold text-red-600">{p.stock} / {Math.max(p.min_stock, settings.inventory?.lowStockThreshold || 0)}</span>
                        </div>
                    ))}
                />

                {/* Daily Closing Card (Always today) */}
                <NewExportCard
                    title="Cierre de Caja (Hoy)"
                    description="Arqueo de caja y resumen operativo del día en curso."
                    icon={Calendar}
                    color="purple"
                    onClick={() => handleExport('daily-closing')}
                    customMetric={
                        <div className="text-right">
                            <div className="text-xs text-gray-400 uppercase font-bold">Ventas Hoy</div>
                            <div className="text-xl font-black text-gray-900 dark:text-white">
                                {settings.currencySymbol}
                                {sales.filter(s => new Date(s.created_at!).toDateString() === new Date().toDateString())
                                    .reduce((acc, s) => acc + s.total, 0).toFixed(2)}
                            </div>
                        </div>
                    }
                />
            </div>


        </div>
    )
}

function NewExportCard({ title, description, count, total, currencySymbol, icon: Icon, color, onClick, previewData, customMetric }: any) {
    const colors = {
        blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800",
        green: "text-green-600 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800",
        purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800",
        red: "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800",
    }

    const solidColors = {
        blue: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30",
        green: "bg-green-600 hover:bg-green-700 text-white shadow-green-500/30",
        purple: "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/30",
        red: "bg-red-600 hover:bg-red-700 text-white shadow-red-500/30",
    }

    // Fallback for color indexing
    const themeClass = colors[color as keyof typeof colors] || colors.blue
    const buttonClass = solidColors[color as keyof typeof solidColors] || solidColors.blue

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-300 dark:border-gray-700 flex flex-col h-full hover:shadow-lg transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-xl transition-colors", themeClass)}>
                    <Icon className="w-6 h-6" />
                </div>
                {customMetric ? customMetric : (total !== undefined && (
                    <div className="text-right">
                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total</div>
                        <div className="text-xl font-black text-gray-900 dark:text-white">{currencySymbol}{total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                    </div>
                ))}
            </div>

            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed flex-grow">{description}</p>

            {/* Live Preview Area - Refined */}
            {previewData && (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vista Previa</span>
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-[10px] font-bold text-gray-500 dark:text-gray-300">
                            {count} registros
                        </span>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-900/30 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                        {count === 0 ? (
                            <div className="p-4 text-center text-xs text-gray-400 italic">No hay datos para mostrar</div>
                        ) : (
                            <div className="space-y-0.5">
                                {previewData}
                                {(count > 3) && (
                                    <div className="text-[10px] text-center text-gray-400 py-1.5 font-medium border-t border-dashed border-gray-100 dark:border-gray-700">
                                        + {count - 3} registros adicionales
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="mt-auto">
                <button
                    onClick={onClick}
                    className={cn(
                        "w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg",
                        buttonClass
                    )}
                >
                    <Download className="w-4 h-4" />
                    Generar PDF
                </button>
            </div>
        </div>
    )
}
