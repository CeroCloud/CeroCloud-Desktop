import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Users, Mail, Phone, MapPin, FileText, History } from 'lucide-react'
import { clientService, type Client } from '@/services/clientService'
import { motion, AnimatePresence } from 'framer-motion'
import { ClientForm } from './ClientForm'
import { ClientHistoryModal } from './ClientHistoryModal'
import { toast } from 'sonner'

export function Clients() {
    const [clients, setClients] = useState<Client[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)
    const [clientForHistory, setClientForHistory] = useState<Client | null>(null)

    const fetchClients = async () => {
        try {
            setLoading(true)
            const data = await clientService.getAll()
            setClients(data)
        } catch (error) {
            console.error('Error fetching clients:', error)
            toast.error('Error al cargar clientes')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClients()
    }, [])

    const handleSearch = async (term: string) => {
        setSearchTerm(term)
        if (term.trim()) {
            try {
                const results = await clientService.search(term)
                setClients(results)
            } catch (error) {
                console.error(error)
            }
        } else {
            fetchClients() // Recargar todo si se limpia la búsqueda
        }
    }

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
            try {
                await clientService.delete(id)
                toast.success('Cliente eliminado')
                fetchClients()
            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                toast.error('Error al eliminar: ' + (error as any).message)
            }
        }
    }

    const handleHistory = (client: Client) => {
        setClientForHistory(client)
        setIsHistoryOpen(true)
    }

    const handleEdit = (client: Client) => {
        setSelectedClient(client)
        setIsFormOpen(true)
    }

    const handleNew = () => {
        setSelectedClient(null)
        setIsFormOpen(true)
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
                            <Users className="w-8 h-8 text-white relative z-10" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400">
                            Clientes
                        </span>
                    </h1>
                    <p className="text-slate-500 dark:text-gray-400 mt-2 text-lg">
                        Gestiona tu base de datos de clientes para facturación y contacto
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNew}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 hover:shadow-indigo-300 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Cliente
                </motion.button>
            </div>

            {/* Controls */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700 flex items-center gap-4 transition-colors">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, NIT, teléfono..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-gray-900 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-slate-600 dark:text-gray-200 placeholder:text-slate-400"
                    />
                </div>
                <div className="text-sm text-slate-400 px-4">
                    {clients.length} clientes encontrados
                </div>
            </div>

            {/* Grid de Clientes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                <AnimatePresence>
                    {clients.map((client) => (
                        <motion.div
                            key={client.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700 p-6 hover:shadow-md transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-purple-400" />

                            <div className="flex justify-between items-start mb-4 pl-3">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white line-clamp-1">{client.name}</h3>
                                    {client.tax_id && (
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-gray-700/50 px-2 py-1 rounded-md w-fit mt-1">
                                            <FileText className="w-3 h-3" />
                                            {client.tax_id}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleHistory(client)}
                                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                        title="Ver Historial de Compras"
                                    >
                                        <History className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(client)}
                                        className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(client.id!)}
                                        className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 pl-3">
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-gray-300">
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                                        <Mail className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                    </div>
                                    <span className="truncate">{client.email || 'Sin correo'}</span>
                                </div>

                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-gray-300">
                                    <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                                        <Phone className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                                    </div>
                                    <span>{client.phone || 'Sin teléfono'}</span>
                                </div>

                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-gray-300">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                        <MapPin className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                                    </div>
                                    <span className="truncate">{client.address || 'Sin dirección'}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {clients.length === 0 && !loading && (
                <div className="text-center py-20 bg-slate-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-gray-700 transition-colors">
                    <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 dark:border-gray-700">
                        <Users className="w-8 h-8 text-slate-300 dark:text-gray-600" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">No hay clientes registrados</h3>
                    <p className="text-slate-500 dark:text-gray-400 max-w-sm mx-auto mt-2">
                        Comienza agregando tu primer cliente para tener un mejor control de tus ventas.
                    </p>
                    <button
                        onClick={handleNew}
                        className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Agregar Cliente
                    </button>
                </div>
            )}

            {/* Modal de Historial */}
            <ClientHistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                client={clientForHistory}
            />

            <ClientForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={fetchClients}
                clientToEdit={selectedClient}
            />
        </div>
    )
}
