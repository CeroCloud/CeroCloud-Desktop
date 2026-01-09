
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Save, Loader2 } from 'lucide-react'
import { supplierService } from '@/services/supplierService'
import { type Supplier } from '@/types/database'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const supplierSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    contact: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
})

type SupplierFormValues = z.infer<typeof supplierSchema>

interface SupplierFormProps {
    supplier: Supplier | null
    onClose: () => void
}

export function SupplierForm({ supplier, onClose }: SupplierFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<SupplierFormValues>({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            name: '',
            contact: '',
            email: '',
            phone: '',
            address: '',
        }
    })

    useEffect(() => {
        if (supplier) {
            reset({
                name: supplier.name,
                contact: supplier.contact || '',
                email: supplier.email || '',
                phone: supplier.phone || '',
                address: supplier.address || '',
            })
        }
    }, [supplier, reset])

    const onSubmit = async (data: SupplierFormValues) => {
        try {
            if (supplier?.id) {
                await supplierService.update(supplier.id, data)
                toast.success('Proveedor actualizado correctamente')
            } else {
                await supplierService.create(data)
                toast.success('Proveedor creado correctamente')
            }
            onClose()
        } catch (error) {
            console.error('Error saving supplier:', error)
            toast.error('Error al guardar el proveedor')
        }
    }

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {supplier ? 'Modifica los datos del proveedor' : 'Agrega un nuevo proveedor'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100  dark:hover:bg-gray-700/50 rounded-xl transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <form id="supplier-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Nombre del proveedor */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Nombre del Proveedor <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register('name')}
                                    placeholder="Ej. Distribuidora XYZ S.A."
                                    className={`w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border ${errors.name
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                        : 'border-gray-200 dark:border-gray-700 focus:ring-primary/20 focus:border-primary'
                                        } focus:ring-2 transition-all outline-none`}
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                            </div>

                            {/* Contacto y Email */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Nombre del Contacto
                                    </label>
                                    <input
                                        type="text"
                                        {...register('contact')}
                                        placeholder="Ej. Juan Pérez"
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        {...register('email')}
                                        placeholder="contacto@proveedor.com"
                                        className={`w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border ${errors.email
                                            ? 'border-red-300 focus:border-red-500'
                                            : 'border-gray-200 dark:border-gray-700 focus:border-primary'
                                            } focus:ring-2 focus:ring-primary/20 transition-all outline-none`}
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                                </div>
                            </div>

                            {/* Teléfono */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    {...register('phone')}
                                    placeholder="+52 123 456 7890"
                                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                />
                            </div>

                            {/* Dirección */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Dirección
                                </label>
                                <textarea
                                    {...register('address')}
                                    rows={2}
                                    placeholder="Calle, número, colonia, ciudad..."
                                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                                />
                            </div>


                        </form>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            form="supplier-form"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 text-sm font-bold bg-primary text-white hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/25 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {supplier ? 'Guardar Cambios' : 'Crear Proveedor'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    )
}
