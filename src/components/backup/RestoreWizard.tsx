/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { X, Upload, CheckCircle, AlertTriangle, FileArchive, Loader2, Lock, Eye, EyeOff, ArrowLeft, Database, Calendar, Package, ShoppingCart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { zipBackupService } from '@/services/zipBackupService'

interface RestoreWizardProps {
    onClose: () => void
    onRestoreComplete: () => void
}

type Step = 'upload-zip' | 'password' | 'confirm' | 'restoring' | 'complete'

export function RestoreWizard({ onClose, onRestoreComplete }: RestoreWizardProps) {
    const [step, setStep] = useState<Step>('upload-zip')
    const [zipFile, setZipFile] = useState<File | null>(null)
    const [backupInfo, setBackupInfo] = useState<any>(null)
    const [isEncrypted, setIsEncrypted] = useState(false)
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isDragging, setIsDragging] = useState(false)

    const handleZipUpload = async (file: File) => {
        if (!file.name.endsWith('.cerobak') && !file.name.endsWith('.cerobak')) {
            toast.error('Por favor selecciona un archivo .cerobak válido')
            return
        }

        try {
            const loadingToast = toast.loading('Analizando archivo de respaldo...')

            // Simular un pequeño delay para UX
            await new Promise(resolve => setTimeout(resolve, 600))

            const info = await zipBackupService.getBackupInfo(file)
            toast.dismiss(loadingToast)

            if (!info.success) {
                toast.error(info.error || 'Archivo de backup inválido')
                return
            }

            setZipFile(file)
            setBackupInfo(info)
            const encrypted = info.metadata?.encrypted || false
            setIsEncrypted(encrypted)

            if (encrypted) {
                toast.info('Este respaldo está protegido con contraseña')
                setStep('password')
            } else {
                toast.success('Archivo validado correctamente')
                setStep('confirm')
            }
        } catch (error) {
            toast.error('Error al leer el archivo')
        }
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleZipUpload(e.dataTransfer.files[0])
        }
    }

    const handleConfirmRestore = async () => {
        if (!zipFile) return

        setStep('restoring')

        try {
            const result = await zipBackupService.restoreZipBackup(zipFile, isEncrypted ? password : undefined)

            if (!result.success || !result.data) {
                toast.error(result.error || 'Error al leer el backup')
                setStep('upload-zip')
                return
            }

            const { data, settings } = result

            // Clear current database completely
            const clearResult = await window.electronAPI.database.clearAll()
            if (!clearResult?.success) {
                throw new Error(clearResult?.error || 'Error al limpiar la base de datos')
            }

            // Insert restored data
            for (const product of data.products) await window.electronAPI.products.create(product)
            for (const category of data.categories || []) {
                if (category.name) await window.electronAPI.categories.create(category.name, category.description)
            }
            for (const sale of data.sales || []) await window.electronAPI.sales.create(sale)
            for (const supplier of data.suppliers || []) await window.electronAPI.suppliers.create(supplier)

            // Restore settings
            if (settings) {
                localStorage.setItem('companySettings', JSON.stringify(settings))
            }

            setStep('complete')
            toast.success('Base de datos restaurada correctamente')
        } catch (error) {
            console.error(error)
            toast.error('Error crítico durante la restauración')
            setStep('upload-zip')
        }
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={step !== 'restoring' ? onClose : undefined}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-white dark:bg-[#0f1117] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 dark:border-gray-800"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-[#0f1117]/80 backdrop-blur sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            {step === 'password' && (
                                <button
                                    onClick={() => setStep('upload-zip')}
                                    className="p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-xl transition-all"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            )}
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Upload className="w-5 h-5 text-primary" />
                                Restaurar Copia
                            </h2>
                        </div>
                        {step !== 'restoring' && (
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <div className="p-8 overflow-y-auto custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {/* Step 1: Upload ZIP */}
                            {step === 'upload-zip' && (
                                <motion.div
                                    key="upload-zip"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-8"
                                >
                                    <div className="text-center">
                                        <div className="relative inline-block">
                                            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"></div>
                                            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-200 dark:border-blue-800 shadow-xl">
                                                <FileArchive className="w-10 h-10 text-blue-600 dark:text-blue-400 drop-shadow-sm" />
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            Selecciona tu Respaldo
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                            Sube el archivo <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">.cerobak</code> para comenzar la restauración de tus datos
                                        </p>
                                    </div>

                                    <div
                                        className={`
                                            relative group border-2 border-dashed rounded-3xl p-12 transition-all duration-300 cursor-pointer text-center
                                            ${isDragging
                                                ? 'border-primary bg-primary/5 scale-[1.02]'
                                                : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 hover:border-primary/50 hover:bg-white dark:hover:bg-gray-800'
                                            }
                                        `}
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={onDrop}
                                    >
                                        <input
                                            type="file"
                                            accept=".cerobak,.cerobak"
                                            onChange={(e) => e.target.files?.[0] && handleZipUpload(e.target.files[0])}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                        />
                                        <div className="relative z-10 pointer-events-none transform group-hover:-translate-y-1 transition-transform duration-300">
                                            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center mx-auto mb-4 text-primary group-hover:text-primary group-hover:scale-110 transition-all">
                                                <Upload className="w-8 h-8" />
                                            </div>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                                Click para buscar archivo
                                            </p>
                                            <p className="text-sm text-gray-500">o arrástralo aquí dentro</p>
                                        </div>
                                    </div>

                                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 flex gap-4 backdrop-blur-sm">
                                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 shrink-0 h-fit">
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-amber-800 dark:text-amber-200 text-sm mb-1">Advertencia Importante</h4>
                                            <p className="text-sm text-amber-700/80 dark:text-amber-300/70 leading-relaxed">
                                                Al restaurar, <strong>todos los datos actuales serán eliminados</strong> y reemplazados por el contenido del respaldo. Asegúrate de tener una copia reciente si es necesario.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Password */}
                            {step === 'password' && (
                                <motion.div
                                    key="password"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-200 dark:border-purple-800">
                                            <Lock className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            Backup Protegido
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Este archivo fue cifrado por seguridad
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                                            Contraseña de descifrado
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Ingresa la contraseña del respaldo"
                                                className="w-full px-5 py-4 pr-12 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-lg"
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors p-2"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-center text-gray-400">
                                            Si has olvidado la contraseña, no será posible recuperar los datos.
                                        </p>
                                    </div>

                                    <button
                                        onClick={async () => {
                                            if (!password) {
                                                toast.error('Por favor ingresa la contraseña')
                                                return
                                            }
                                            if (!zipFile) return

                                            const loadingToast = toast.loading('Verificando credenciales...')
                                            try {
                                                const info = await zipBackupService.getBackupInfo(zipFile, password)
                                                toast.dismiss(loadingToast)

                                                if (info.success) {
                                                    setBackupInfo(info)
                                                    setStep('confirm')
                                                } else {
                                                    toast.error(info.error || 'Contraseña incorrecta')
                                                }
                                            } catch (error) {
                                                toast.dismiss(loadingToast)
                                                toast.error('Error al validar contraseña')
                                            }
                                        }}
                                        disabled={!password}
                                        className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
                                    >
                                        Desbloquear y Continuar
                                    </button>
                                </motion.div>
                            )}

                            {/* Step 3: Confirm */}
                            {step === 'confirm' && backupInfo && (
                                <motion.div
                                    key="confirm"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-800">
                                            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            ¿Confirmar Restauración?
                                        </h3>
                                        <p className="text-red-500 dark:text-red-400 mt-1 font-medium">
                                            Esta acción es irreversible y sobrescribirá tus datos
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-200 dark:border-gray-800">
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">Contenido de la Copia</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {backupInfo.metadata && (
                                                <div className="col-span-2 flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                                                        <Calendar className="w-4 h-4" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-xs text-gray-500">Fecha de Creación</p>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                            {new Date(backupInfo.metadata.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {backupInfo.stats && (
                                                <>
                                                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600">
                                                            <Package className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Productos</p>
                                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                                {backupInfo.stats.productsCount}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600">
                                                            <ShoppingCart className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Ventas</p>
                                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                                {backupInfo.stats.salesCount}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-2">
                                        <button
                                            onClick={() => setStep('upload-zip')}
                                            className="flex-1 px-6 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold transition-all"
                                        >
                                            Inseguro (Cancelar)
                                        </button>
                                        <button
                                            onClick={handleConfirmRestore}
                                            className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                                        >
                                            <Database className="w-5 h-5" />
                                            Restaurar Datos
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4: Restoring */}
                            {step === 'restoring' && (
                                <motion.div
                                    key="restoring"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-12 text-center"
                                >
                                    <div className="relative mb-8">
                                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
                                        <Loader2 className="w-20 h-20 text-primary animate-spin relative z-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        Restaurando Base de Datos...
                                    </h3>
                                    <p className="text-gray-500 max-w-xs mx-auto">
                                        Por favor no cierres la aplicación hasta que el proceso termine.
                                    </p>
                                </motion.div>
                            )}

                            {/* Step 5: Complete */}
                            {step === 'complete' && (
                                <motion.div
                                    key="complete"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-8 text-center"
                                >
                                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6 animate-bounce border border-green-200 dark:border-green-800">
                                        <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-500 drop-shadow-sm" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                                        ¡Restauración Exitosa!
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto text-lg">
                                        Todos tus datos han sido recuperados correctamente. La aplicación se reiniciará.
                                    </p>
                                    <button
                                        onClick={() => {
                                            onRestoreComplete()
                                            window.location.reload()
                                        }}
                                        className="px-10 py-4 bg-primary text-white rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl shadow-primary/30 flex items-center gap-2"
                                    >
                                        <Database className="w-5 h-5" />
                                        Reiniciar Aplicación Ahora
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
