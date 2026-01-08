import { useState } from 'react'
import { X, Upload, FileSpreadsheet, Download, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { importService } from '@/services/importService'
import { Product } from '@/types/database'
import { motion, AnimatePresence } from 'framer-motion'


interface ImportWizardProps {
    onClose: () => void
    onSuccess: () => void
}

type Step = 'select' | 'preview' | 'importing' | 'complete'

export function ImportWizard({ onClose, onSuccess }: ImportWizardProps) {
    const [step, setStep] = useState<Step>('select')
    const [previewData, setPreviewData] = useState<Partial<Product>[]>([])
    const [errors, setErrors] = useState<string[]>([])
    const [validCount, setValidCount] = useState(0)
    const [invalidCount, setInvalidCount] = useState(0)
    const [importedCount, setImportedCount] = useState(0)

    const handleFileSelect = async (selectedFile: File) => {
        const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase()

        let result
        if (fileExtension === 'xlsx' || fileExtension === 'xls') {
            result = await importService.parseExcel(selectedFile)
        } else if (fileExtension === 'csv') {
            result = await importService.parseCSV(selectedFile)
        } else {
            setErrors(['Formato de archivo no soportado. Use Excel (.xlsx) o CSV (.csv)'])
            return
        }

        if (result.success && result.data) {
            setPreviewData(result.data)
            setValidCount(result.validCount || 0)
            setInvalidCount(result.invalidCount || 0)
            setErrors(result.errors || [])
            setStep('preview')
        } else {
            setErrors(result.errors || ['Error desconocido'])
        }
    }

    const handleImport = async () => {
        setStep('importing')
        let imported = 0
        let updated = 0

        try {
            for (const product of previewData) {
                const result = await window.electronAPI.products.createOrUpdate(product as Omit<Product, 'id'>)
                if (result.isNew) {
                    imported++
                } else {
                    updated++
                }
                setImportedCount(imported + updated)
                await new Promise(resolve => setTimeout(resolve, 20)) // Faster simulation
            }
            setStep('complete')
            onSuccess()
        } catch (error) {
            setErrors(['Error crítico durante la importación: ' + error])
            setStep('preview')
        }
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur sticky top-0 z-10">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Upload className="w-5 h-5 text-primary" />
                                Asistente de Importación
                            </h2>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-8 flex-1 overflow-y-auto">
                        <AnimatePresence mode="wait">
                            {step === 'select' && (
                                <motion.div
                                    key="select"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-8"
                                >
                                    <div className="text-center max-w-lg mx-auto">
                                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <FileSpreadsheet className="w-12 h-12 text-primary" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                            Sube tu inventario
                                        </h3>
                                        <p className="text-gray-500 text-lg">
                                            Arrastra tu archivo Excel o CSV aquí para comenzar a importar tus productos masivamente.
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
                                                <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                                                    <Download className="w-4 h-4" />
                                                    Plantilla Oficial
                                                </h4>
                                                <p className="text-sm text-blue-700 dark:text-blue-200 mb-4 leading-relaxed">
                                                    Para asegurar una importación exitosa, te recomendamos usar nuestra plantilla pre-formateada.
                                                </p>
                                                <button
                                                    onClick={() => importService.downloadTemplate()}
                                                    className="w-full py-2.5 bg-white text-blue-600 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all text-sm"
                                                >
                                                    Descargar Plantilla Excel
                                                </button>
                                            </div>

                                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
                                                <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-4 text-sm uppercase tracking-wide">
                                                    Columnas Requeridas
                                                </h4>
                                                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                                                    {['codigo', 'nombre', 'precio', 'stock', 'categoria', 'costo', 'unidad', 'min_stock'].map(col => (
                                                        <div key={col} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                            <CheckCircle className="w-3 h-3 text-green-500" />
                                                            {col}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-primary/50 transition-all cursor-pointer group bg-white dark:bg-gray-800">
                                            <div className="text-center p-8 space-y-4">
                                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">Click para explorar</p>
                                                    <p className="text-gray-400 text-sm mt-1">.xlsx, .xls, .csv soportados</p>
                                                </div>
                                            </div>
                                            <input
                                                type="file"
                                                accept=".xlsx,.xls,.csv"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) handleFileSelect(file)
                                                }}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    {errors.length > 0 && (
                                        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-bold">Error en el archivo</p>
                                                <p className="text-sm">{errors[0]}</p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {step === 'preview' && (
                                <motion.div
                                    key="preview"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Vista Previa</h3>
                                            <p className="text-gray-500">Revisa los datos antes de importar</p>
                                        </div>
                                        <div className="flex gap-2 text-sm font-medium">
                                            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> {validCount} válidos
                                            </div>
                                            {invalidCount > 0 && (
                                                <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> {invalidCount} errores
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                                        <div className="max-h-[400px] overflow-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
                                                    <tr>
                                                        {['Código', 'Nombre', 'Categoría', 'Precio', 'Stock'].map(h => (
                                                            <th key={h} className="px-4 py-3 text-left font-semibold text-gray-500">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                    {previewData.slice(0, 100).map((row, i) => (
                                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                            <td className="px-4 py-2 font-mono text-xs">{row.code || '-'}</td>
                                                            <td className="px-4 py-2 font-medium">{row.name || '-'}</td>
                                                            <td className="px-4 py-2 text-gray-500">{row.category || '-'}</td>
                                                            <td className="px-4 py-2 text-primary font-bold">${row.price}</td>
                                                            <td className="px-4 py-2">{row.stock}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {errors.length > 0 && (
                                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 text-sm">
                                            <p className="font-bold mb-1">Advertencias:</p>
                                            <ul className="list-disc list-inside opacity-80">
                                                {errors.slice(0, 3).map((e, i) => <li key={i}>{e}</li>)}
                                                {errors.length > 3 && <li>... y {errors.length - 3} más</li>}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            onClick={() => { setStep('select'); setPreviewData([]) }}
                                            className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                                        >
                                            Atrás
                                        </button>
                                        <button
                                            onClick={handleImport}
                                            disabled={validCount === 0}
                                            className="flex-[2] py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-bold shadow-lg shadow-primary/25 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                                        >
                                            Confirmar Importación
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 'importing' && (
                                <motion.div
                                    key="importing"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-12 space-y-8"
                                >
                                    <div className="relative">
                                        <svg className="w-32 h-32 transform -rotate-90">
                                            <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200 dark:text-gray-700" />
                                            <circle cx="64" cy="64" r="60" stroke="#3b82f6" strokeWidth="8" fill="transparent" strokeDasharray={377} strokeDashoffset={377 - (377 * importedCount) / validCount} className="transition-all duration-300 ease-out" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className="text-3xl font-bold text-gray-900 dark:text-white">{Math.round((importedCount / validCount) * 100)}%</span>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Importando productos...</h3>
                                        <p className="text-gray-500">{importedCount} de {validCount} completados</p>
                                    </div>
                                </motion.div>
                            )}

                            {step === 'complete' && (
                                <motion.div
                                    key="complete"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-12 space-y-6 text-center"
                                >
                                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                                        <CheckCircle className="w-12 h-12 text-green-600" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">¡Importación Exitosa!</h3>
                                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md">
                                        Se han agregado correctamente <strong>{importedCount}</strong> productos a tu inventario.
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="px-8 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-xl"
                                    >
                                        Finalizar
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
