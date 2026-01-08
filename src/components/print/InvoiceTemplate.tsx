import { forwardRef } from 'react'
import { Sale, CompanySettings } from '@/types/database'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface InvoiceTemplateProps {
    sale: Sale
    settings: CompanySettings
}

export const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(({ sale, settings }, ref) => {
    return (
        <div ref={ref} className="w-[800px] min-h-[1100px] bg-white p-12 text-gray-900 border border-t-8 border-t-primary" id="invoice-template">
            {/* Header */}
            <div className="flex justify-between items-start mb-12">
                <div className="flex gap-4 items-center">
                    {/* Logo (if available) - Assuming it's base64 or URL */}
                    <img
                        src={settings.logo || 'logo.png'}
                        alt="Logo"
                        className="w-24 h-24 object-contain"
                    />
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">{settings.name || 'Empresa'}</h1>
                        <div className="text-gray-500 text-sm mt-2 space-y-0.5">
                            {settings.address && <p>{settings.address}</p>}
                            {(settings.phone || settings.email) && <p>{[settings.phone, settings.email].filter(Boolean).join(' · ')}</p>}
                            {settings.taxId && <p className="font-medium text-primary">RFC: {settings.taxId}</p>}
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <h2 className="text-xl font-bold text-gray-400 uppercase tracking-widest mb-1">Factura</h2>
                    <p className="text-4xl font-mono font-bold text-gray-900">#{sale.id?.toString().padStart(6, '0')}</p>
                    <p className="text-gray-500 mt-2 font-medium">
                        Fecha: {format(new Date(sale.created_at!), "dd 'de' MMMM, yyyy", { locale: es })}
                    </p>
                    <div className="mt-4 bg-gray-50 px-4 py-2 rounded-lg inline-block">
                        <span className={`text-xs font-bold uppercase tracking-wider ${sale.status === 'completed' ? 'text-green-600' : 'text-red-600'}`}>
                            {sale.status === 'completed' ? 'Pagado' : sale.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Client Info */}
            <div className="bg-gray-50 rounded-xl p-6 mb-12 flex justify-between">
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Facturar a</h3>
                    <p className="text-lg font-bold text-gray-900">{sale.customer_name || 'Cliente General'}</p>
                    <p className="text-gray-500 text-sm">Cliente Mostrador</p>
                </div>
                <div className="text-right">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Método de Pago</h3>
                    <p className="text-lg font-bold text-gray-900 capitalize">{sale.payment_method}</p>
                </div>
            </div>

            {/* Items Table */}
            <div className="mb-12">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-gray-100">
                            <th className="py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400 w-[50%]">Descripción</th>
                            <th className="py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-400">Cant.</th>
                            <th className="py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-400">Precio</th>
                            <th className="py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-400">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {sale.items.map((item, index) => (
                            <tr key={index}>
                                <td className="py-4">
                                    <p className="font-bold text-gray-900">{item.product_name}</p>
                                    <p className="text-xs text-gray-400">Código: {item.product_id}</p>
                                </td>
                                <td className="py-4 text-center font-medium text-gray-600">{item.quantity}</td>
                                <td className="py-4 text-right font-medium text-gray-600">
                                    {settings.currencySymbol}{item.unit_price.toFixed(2)}
                                </td>
                                <td className="py-4 text-right font-bold text-gray-900">
                                    {settings.currencySymbol}{item.subtotal.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-20">
                <div className="w-1/3">
                    <div className="flex justify-between py-2 text-gray-500">
                        <span>Subtotal</span>
                        <span>{settings.currencySymbol}{sale.subtotal.toFixed(2)}</span>
                    </div>
                    {sale.discount > 0 && (
                        <div className="flex justify-between py-2 text-green-600">
                            <span>Descuento</span>
                            <span>-{settings.currencySymbol}{sale.discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between py-2 text-gray-500 border-b border-gray-100 pb-4">
                        <span>Impuestos ({settings.taxRate}%)</span>
                        <span>{settings.currencySymbol}{sale.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-4 text-2xl font-black text-gray-900">
                        <span>Total</span>
                        <span>{settings.currencySymbol}{sale.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-gray-400 text-sm border-t border-gray-100 pt-8">
                <p className="mb-2">{settings.invoice?.disclaimer || 'Gracias por su compra'}</p>
                <p className="text-xs">Documento generado electrónicamente por CeroCloud</p>
            </div>
        </div>
    )
})

InvoiceTemplate.displayName = 'InvoiceTemplate'
