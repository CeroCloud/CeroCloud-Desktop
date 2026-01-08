/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react'
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Package,
    Upload,
    LayoutGrid,
    List,
    ArrowUpDown,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react'
import { productService } from '@/services/productService'
import { companyService } from '@/services/companyService'
import { Product } from '@/types/database'
import { ProductForm } from './ProductForm'
import { ImportWizard } from '@/components/inventory/ImportWizard'
import { useUIStore } from '@/stores/uiStore'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, getImageSrc } from '@/lib/utils'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
// If button component doesn't exist, I'll use standard buttons with Tailwind

type SortField = 'name' | 'price' | 'stock'
type SortOrder = 'asc' | 'desc'

export function Inventory() {
    // Global UI State
    const { inventoryViewMode, setInventoryViewMode } = useUIStore()
    const [settings] = useState(companyService.getSettings())

    // Local State
    const [products, setProducts] = useState<Product[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [sortField, setSortField] = useState<SortField>('name')
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

    // Confirm Dialog State
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [productToDelete, setProductToDelete] = useState<number | null>(null)

    // Modals & Loading
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isImportOpen, setIsImportOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)

    // Load Data
    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        try {
            setLoading(true)
            const data = await productService.getAll()
            setProducts(data)
        } catch (error) {
            console.error('Error loading products:', error)
            toast.error('Error al cargar productos')
        } finally {
            setLoading(false)
        }
    }

    // Actions
    const handleDeleteClick = (id: number) => {
        setProductToDelete(id)
        setConfirmOpen(true)
    }

    const confirmDelete = async () => {
        if (productToDelete) {
            try {
                await productService.delete(productToDelete)
                setProducts(prev => prev.filter(p => p.id !== productToDelete))
                toast.success('Producto eliminado correctamente')
            } catch (error) {
                console.error('Error deleting product:', error)
                toast.error('Error al eliminar producto')
            } finally {
                setConfirmOpen(false)
                setProductToDelete(null)
            }
        }
    }

    const handleEdit = (product: Product) => {
        setEditingProduct(product)
        setIsFormOpen(true)
    }

    // filtering & Sorting
    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category || 'Sin Categoría'))
        return ['all', ...Array.from(cats)]
    }, [products])

    const filteredAndSortedProducts = useMemo(() => {
        let result = [...products]

        // 1. Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase()
            result = result.filter(p =>
                p.name.toLowerCase().includes(lowerTerm) ||
                p.code.toLowerCase().includes(lowerTerm) ||
                p.category?.toLowerCase().includes(lowerTerm)
            )
        }

        // 2. Category Filter
        if (selectedCategory !== 'all') {
            result = result.filter(p => (p.category || 'Sin Categoría') === selectedCategory)
        }

        // 3. Sorting
        result.sort((a, b) => {
            let valA: any = a[sortField]
            let valB: any = b[sortField]

            if (typeof valA === 'string') valA = valA.toLowerCase()
            if (typeof valB === 'string') valB = valB.toLowerCase()

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1
            return 0
        })

        return result
    }, [products, searchTerm, selectedCategory, sortField, sortOrder])

    // Render Helpers
    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('asc')
        }
    }

    return (
        <div className="space-y-6 pb-20">
            {/* HEADER & ACTIONS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        Inventario
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Gestiona tus {products.length} productos
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                    >
                        <Upload className="w-4 h-4" />
                        Importar
                    </button>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-medium shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo Producto
                    </button>
                </div>
            </div>

            {/* TOOLBAR (Search, Filters, View Toggle) */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border border-gray-300 dark:border-gray-700 flex flex-col lg:flex-row gap-4 justify-between items-center sticky top-0 z-10 backdrop-blur-xl bg-opacity-90 dark:bg-opacity-90">
                {/* Search */}
                <div className="relative w-full lg:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, código, categoría..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                </div>

                {/* Filters & Toggles */}
                <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
                    {/* Category Selector - Adaptive */}
                    <div className="flex items-center gap-2 flex-1 lg:flex-none">
                        {categories.length <= 5 ? (
                            <div className="flex items-center gap-2 overflow-x-auto max-w-[200px] sm:max-w-none scrollbar-hide">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0",
                                            selectedCategory === cat
                                                ? "bg-primary/10 text-primary border border-primary/20"
                                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        )}
                                    >
                                        {cat === 'all' ? 'Todos' : cat}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="relative w-full lg:w-48">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 pl-4 pr-10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow cursor-pointer"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>
                                            {cat === 'all' ? 'Todas las Categorías' : cat}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                    <ArrowUpDown className="w-4 h-4" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden lg:block" />

                    {/* View Toggle */}
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button
                            onClick={() => setInventoryViewMode('list')}
                            className={cn(
                                "p-2 rounded-md transition-all",
                                inventoryViewMode === 'list'
                                    ? "bg-white dark:bg-gray-800 text-primary shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            )}
                            title="Vista Lista"
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setInventoryViewMode('grid')}
                            className={cn(
                                "p-2 rounded-md transition-all",
                                inventoryViewMode === 'grid'
                                    ? "bg-white dark:bg-gray-800 text-primary shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            )}
                            title="Vista Cuadrícula"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* CONTENT AREA */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-gray-500 font-medium">Cargando inventario...</p>
                        </div>
                    </div>
                ) : filteredAndSortedProducts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            No se encontraron productos
                        </h3>
                        <p className="text-gray-500 mt-2">
                            Intenta con otra búsqueda o agrega un nuevo producto.
                        </p>
                    </motion.div>
                ) : (
                    <>
                        {inventoryViewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredAndSortedProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        settings={settings}
                                        onEdit={() => handleEdit(product)}
                                        onDelete={() => handleDeleteClick(product.id!)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                                                <th
                                                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-primary transition-colors"
                                                    onClick={() => toggleSort('name')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Detalles
                                                        <ArrowUpDown className="w-3 h-3" />
                                                    </div>
                                                </th>
                                                <th
                                                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-primary transition-colors"
                                                    onClick={() => toggleSort('price')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Precio
                                                        <ArrowUpDown className="w-3 h-3" />
                                                    </div>
                                                </th>
                                                <th
                                                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-primary transition-colors"
                                                    onClick={() => toggleSort('stock')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Stock
                                                        <ArrowUpDown className="w-3 h-3" />
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {filteredAndSortedProducts.map((product) => (
                                                <ProductRow
                                                    key={product.id}
                                                    product={product}
                                                    settings={settings}
                                                    onEdit={() => handleEdit(product)}
                                                    onDelete={() => handleDeleteClick(product.id!)}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </AnimatePresence>

            {/* MODALS */}
            {isFormOpen && (
                <ProductForm
                    product={editingProduct}
                    onClose={() => {
                        setIsFormOpen(false)
                        setEditingProduct(null)
                        loadProducts()
                    }}
                />
            )}

            {isImportOpen && (
                <ImportWizard
                    onClose={() => setIsImportOpen(false)}
                    onSuccess={() => {
                        loadProducts()
                        setIsImportOpen(false)
                    }}
                />
            )}

            <ConfirmDialog
                isOpen={confirmOpen}
                title="¿Eliminar producto?"
                description="Esta acción no se puede deshacer. El producto será eliminado permanentemente del inventario."
                confirmText="Sí, eliminar"
                variant="danger"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmOpen(false)}
            />
        </div>
    )
}

// --- Subcomponents ---

function ProductCard({ product, settings, onEdit, onDelete }: { product: Product; settings?: any; onEdit: () => void; onDelete: () => void }) {
    const isLowStock = product.stock <= (settings?.inventory?.lowStockThreshold ?? product.min_stock)

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        >
            {/* Image / Thumbnail */}
            <div className="aspect-video w-full bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                {product.image ? (
                    <img
                        src={getImageSrc(product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                        <Package className="w-12 h-12" />
                    </div>
                )}

                {/* Overlay actions on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                    <button
                        onClick={onEdit}
                        className="p-2 bg-white rounded-full text-gray-900 hover:bg-primary hover:text-white transition-colors"
                        title="Editar"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 bg-white rounded-full text-red-600 hover:bg-red-500 hover:text-white transition-colors"
                        title="Eliminar"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {product.category || 'General'}
                        </span>
                        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1" title={product.name}>
                            {product.name}
                        </h3>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-primary">
                            {settings?.currencySymbol || '$'}{product.price.toFixed(2)}
                        </span>
                    </div>

                    <div className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1",
                        isLowStock
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    )}>
                        {isLowStock ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {product.stock} un.
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

function ProductRow({ product, settings, onEdit, onDelete }: { product: Product; settings?: any; onEdit: () => void; onDelete: () => void }) {
    const isLowStock = product.stock <= (settings?.inventory?.lowStockThreshold ?? product.min_stock)

    return (
        <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 dark:border-gray-600">
                        {product.image ? (
                            <img src={getImageSrc(product.image)} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <Package className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{product.code}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    {product.category || 'Sin Categoría'}
                </span>
            </td>
            <td className="px-6 py-4">
                <p className="font-bold text-gray-900 dark:text-white">
                    {settings?.currencySymbol || '$'}{product.price.toFixed(2)}
                </p>
                {product.cost && (
                    <p className="text-xs text-gray-500">Costo: {settings?.currencySymbol || '$'}{product.cost.toFixed(2)}</p>
                )}
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "w-2 h-2 rounded-full",
                        isLowStock ? "bg-red-500 animate-pulse" : "bg-green-500"
                    )} />
                    <span className={cn(
                        "text-sm font-medium",
                        isLowStock ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                    )}>
                        {product.stock} {product.unit}
                    </span>
                </div>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onEdit}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Editar"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Eliminar"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </motion.tr>
    )
}
