
import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Package, Mail, Phone, MapPin, User } from 'lucide-react'
import { supplierService, type Supplier } from '@/services/supplierService'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SupplierForm } from './SupplierForm'

export function Suppliers() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [supplierToDelete, setSupplierToDelete] = useState<number | null>(null)

    useEffect(() => {
        loadSuppliers()
    }, [])

    const loadSuppliers = async () => {
        try {
            setLoading(true)
            const data = await supplierService.getAll()
            setSuppliers(data)
        } catch (error) {
            console.error('Error loading suppliers:', error)
            toast.error('Error al cargar proveedores')
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier)
        setIsFormOpen(true)
    }

    const handleDeleteClick = (id: number) => {
        setSupplierToDelete(id)
        setConfirmOpen(true)
    }

    const confirmDelete = async () => {
        if (supplierToDelete) {
            try {
                await supplierService.delete(supplierToDelete)
                setSuppliers(prev => prev.filter(s => s.id !== supplierToDelete))
                toast.success('Proveedor eliminado correctamente')
            } catch (error) {
                console.error('Error deleting supplier:', error)
                toast.error('Error al eliminar proveedor')
            } finally {
                setConfirmOpen(false)
                setSupplierToDelete(null)
            }
        }
    }

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6 pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        Proveedores
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Gestiona tus {suppliers.length} proveedores
                    </p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-medium shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Proveedor
                </button>
            </div>

            {/* SEARCH BAR */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border border-gray-300 dark:border-gray-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, contacto, email o teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                </div>
            </div>

            {/* CONTENT */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-gray-500 font-medium">Cargando proveedores...</p>
                        </div>
                    </div>
                ) : filteredSuppliers.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            No se encontraron proveedores
                        </h3>
                        <p className="text-gray-500 mt-2">
                            {searchTerm ? 'Intenta con otra búsqueda' : 'Agrega tu primer proveedor'}
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSuppliers.map((supplier) => (
                            <SupplierCard
                                key={supplier.id}
                                supplier={supplier}
                                onEdit={() => handleEdit(supplier)}
                                onDelete={() => handleDeleteClick(supplier.id!)}
                            />
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* MODALS */}
            {isFormOpen && (
                <SupplierForm
                    supplier={editingSupplier}
                    onClose={() => {
                        setIsFormOpen(false)
                        setEditingSupplier(null)
                        loadSuppliers()
                    }}
                />
            )}

            <ConfirmDialog
                isOpen={confirmOpen}
                title="¿Eliminar proveedor?"
                description="Esta acción no se puede deshacer. El proveedor será eliminado permanentemente."
                confirmText="Sí, eliminar"
                variant="danger"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmOpen(false)}
            />
        </div>
    )
}

function SupplierCard({ supplier, onEdit, onDelete }: { supplier: Supplier; onEdit: () => void; onDelete: () => void }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        >
            {/* Header with gradient */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg line-clamp-1">{supplier.name}</h3>
                            {supplier.contact_name && (
                                <p className="text-white/80 text-sm flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {supplier.contact_name}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {supplier.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Mail className="w-4 h-4 text-primary" />
                        <span className="truncate">{supplier.email}</span>
                    </div>
                )}
                {supplier.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Phone className="w-4 h-4 text-primary" />
                        <span>{supplier.phone}</span>
                    </div>
                )}
                {supplier.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{supplier.address}</span>
                    </div>
                )}
                {supplier.notes && (
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {supplier.notes}
                        </p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 flex gap-2">
                <button
                    onClick={onEdit}
                    className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                >
                    <Edit2 className="w-4 h-4" />
                    Editar
                </button>
                <button
                    onClick={onDelete}
                    className="flex-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                </button>
            </div>
        </motion.div>
    )
}
