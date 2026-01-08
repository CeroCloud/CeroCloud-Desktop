import { Product, Sale } from '@/types/database'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import { companyService } from './companyService'

export const exportService = {
    // Export products to CSV
    exportProductsCSV: (products: Product[]) => {
        const headers = ['Código', 'Nombre', 'Descripción', 'Categoría', 'Precio', 'Costo', 'Stock', 'Stock Mínimo', 'Unidad']
        const rows = products.map(p => [
            p.code,
            p.name,
            p.description || '',
            p.category || '',
            p.price.toString(),
            (p.cost || 0).toString(),
            p.stock.toString(),
            p.min_stock.toString(),
            p.unit
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        saveAs(blob, `inventario_${new Date().toISOString().split('T')[0]}.csv`)
    },

    // Export sales to CSV
    exportSalesCSV: (sales: Sale[]) => {
        const headers = ['ID', 'Fecha', 'Cliente', 'Subtotal', 'Descuento', 'IVA', 'Total', 'Método de Pago', 'Estado']
        const rows = sales.map(s => [
            s.id?.toString() || '',
            s.created_at ? new Date(s.created_at).toLocaleString('es-MX') : '',
            s.customer_name || 'N/A',
            s.subtotal.toFixed(2),
            s.discount.toFixed(2),
            s.tax.toFixed(2),
            s.total.toFixed(2),
            s.payment_method,
            s.status
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        saveAs(blob, `ventas_${new Date().toISOString().split('T')[0]}.csv`)
    },

    // Export sales with details to CSV
    exportSalesDetailedCSV: (sales: Sale[]) => {
        const headers = ['Venta ID', 'Fecha', 'Cliente', 'Producto', 'Cantidad', 'Precio Unit.', 'Subtotal Producto', 'Total Venta', 'Método Pago']
        const rows: string[][] = []

        sales.forEach(sale => {
            sale.items.forEach(item => {
                rows.push([
                    sale.id?.toString() || '',
                    sale.created_at ? new Date(sale.created_at).toLocaleString('es-MX') : '',
                    sale.customer_name || 'N/A',
                    item.product_name,
                    item.quantity.toString(),
                    item.unit_price.toFixed(2),
                    item.subtotal.toFixed(2),
                    sale.total.toFixed(2),
                    sale.payment_method
                ])
            })
        })

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        saveAs(blob, `ventas_detalladas_${new Date().toISOString().split('T')[0]}.csv`)
    },

    // Export low stock products
    exportLowStockCSV: (products: Product[]) => {
        const lowStock = products.filter(p => p.stock <= p.min_stock)

        const headers = ['Código', 'Nombre', 'Stock Actual', 'Stock Mínimo', 'Diferencia', 'Precio']
        const rows = lowStock.map(p => [
            p.code,
            p.name,
            p.stock.toString(),
            p.min_stock.toString(),
            (p.min_stock - p.stock).toString(),
            p.price.toFixed(2)
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        saveAs(blob, `productos_bajo_stock_${new Date().toISOString().split('T')[0]}.csv`)
    },

    // Export invoice to PDF
    exportInvoicePDF: (sale: Sale) => {
        const doc = new jsPDF()
        const company = companyService.getSettings()

        // Logo if exists
        if (company.logo) {
            try {
                doc.addImage(company.logo, 'PNG', 15, 10, 30, 30)
            } catch (e) {
                console.error('Error adding logo:', e)
            }
        }

        // Header
        doc.setFontSize(20)
        doc.text('FACTURA / RECIBO', 105, 20, { align: 'center' })

        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text(company.name || 'CeroCloud', 105, 30, { align: 'center' })
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)

        if (company.address) doc.text(company.address.substring(0, 60), 105, 36, { align: 'center' })
        if (company.phone || company.email) {
            doc.text(`${company.phone || ''} ${company.email || ''}`.trim(), 105, 42, { align: 'center' })
        }
        if (company.taxId) doc.text(`RFC: ${company.taxId}`, 105, 47, { align: 'center' })

        // Sale info
        doc.setFontSize(12)
        doc.text(`Venta #${sale.id}`, 20, 60)
        doc.text(`Fecha: ${sale.created_at ? new Date(sale.created_at).toLocaleString('es-MX') : ''}`, 20, 68)
        doc.text(`Cliente: ${sale.customer_name || 'Cliente general'}`, 20, 76)
        doc.text(`Método de Pago: ${sale.payment_method.toUpperCase()}`, 20, 84)

        // Table headers
        doc.setFontSize(10)
        doc.text('Producto', 20, 100)
        doc.text('Cant.', 110, 100)
        doc.text('Precio', 140, 100)
        doc.text('Total', 170, 100)

        doc.line(20, 102, 190, 102)

        // Items
        let yPos = 110
        sale.items.forEach((item) => {
            doc.text(item.product_name.substring(0, 30), 20, yPos)
            doc.text(item.quantity.toString(), 110, yPos)
            doc.text(`$${item.unit_price.toFixed(2)}`, 140, yPos)
            doc.text(`$${item.subtotal.toFixed(2)}`, 170, yPos)
            yPos += 8
        })

        // Totals
        yPos += 10
        doc.line(20, yPos, 190, yPos)
        yPos += 8

        doc.text('Subtotal:', 140, yPos)
        doc.text(`$${sale.subtotal.toFixed(2)}`, 170, yPos)
        yPos += 6

        if (sale.discount > 0) {
            doc.text('Descuento:', 140, yPos)
            doc.text(`-$${sale.discount.toFixed(2)}`, 170, yPos)
            yPos += 6
        }

        doc.text('IVA (16%):', 140, yPos)
        doc.text(`$${sale.tax.toFixed(2)}`, 170, yPos)
        yPos += 8

        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('TOTAL:', 140, yPos)
        doc.text(`$${sale.total.toFixed(2)}`, 170, yPos)

        // Footer
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text('Gracias por su compra', 105, 280, { align: 'center' })

        // Save
        doc.save(`factura_${sale.id}_${new Date().toISOString().split('T')[0]}.pdf`)
    },

    // Export daily closing report to PDF
    exportDailyClosingPDF: (sales: Sale[], date: Date) => {
        const doc = new jsPDF()

        const total = sales.reduce((sum, s) => sum + s.total, 0)
        const cash = sales.filter(s => s.payment_method === 'cash').reduce((sum, s) => sum + s.total, 0)
        const card = sales.filter(s => s.payment_method === 'card').reduce((sum, s) => sum + s.total, 0)
        const transfer = sales.filter(s => s.payment_method === 'transfer').reduce((sum, s) => sum + s.total, 0)

        // Header
        doc.setFontSize(18)
        doc.text('CIERRE DE CAJA DIARIO', 105, 20, { align: 'center' })

        doc.setFontSize(12)
        doc.text(`Fecha: ${date.toLocaleDateString('es-MX')}`, 105, 35, { align: 'center' })

        // Summary
        doc.setFontSize(14)
        doc.text('Resumen del Día', 20, 55)

        doc.setFontSize(11)
        doc.text(`Total de Ventas: ${sales.length}`, 20, 70)
        doc.text(`Ingresos Totales: $${total.toFixed(2)}`, 20, 78)

        doc.text('Por Método de Pago:', 20, 95)
        doc.setFontSize(10)
        doc.text(`Efectivo: $${cash.toFixed(2)}`, 30, 103)
        doc.text(`Tarjeta: $${card.toFixed(2)}`, 30, 111)
        doc.text(`Transferencia: $${transfer.toFixed(2)}`, 30, 119)

        // Table
        doc.setFontSize(10)
        doc.text('Detalle de Ventas', 20, 140)
        doc.text('#', 20, 150)
        doc.text('Hora', 40, 150)
        doc.text('Cliente', 70, 150)
        doc.text('Items', 120, 150)
        doc.text('Total', 150, 150)
        doc.text('Pago', 175, 150)

        doc.line(20, 152, 190, 152)

        let yPos = 160
        sales.forEach((sale, index) => {
            if (yPos > 270) {
                doc.addPage()
                yPos = 20
            }

            const time = sale.created_at ? new Date(sale.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : ''

            doc.text(`${index + 1}`, 20, yPos)
            doc.text(time, 40, yPos)
            doc.text((sale.customer_name || 'N/A').substring(0, 15), 70, yPos)
            doc.text(sale.items.length.toString(), 120, yPos)
            doc.text(`$${sale.total.toFixed(2)}`, 150, yPos)
            doc.text(sale.payment_method, 175, yPos)

            yPos += 7
        })

        // Save
        doc.save(`cierre_caja_${date.toISOString().split('T')[0]}.pdf`)
    },

    // Export complete inventory to PDF
    exportInventoryPDF: (products: Product[]) => {
        const doc = new jsPDF()
        const company = companyService.getSettings()

        // Logo if exists
        if (company.logo) {
            try {
                doc.addImage(company.logo, 'PNG', 15, 10, 25, 25)
            } catch (e) {
                console.error('Error adding logo:', e)
            }
        }

        // Header
        doc.setFontSize(20)
        doc.setFont('helvetica', 'bold')
        doc.text('REPORTE DE INVENTARIO', 105, 20, { align: 'center' })

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(`Generado: ${new Date().toLocaleDateString('es-MX')} ${new Date().toLocaleTimeString('es-MX')}`, 105, 28, { align: 'center' })

        // Summary with visual bars
        const totalProducts = products.length
        const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)
        const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
        const lowStock = products.filter(p => p.stock <= p.min_stock).length

        // Stats boxes
        doc.setFillColor(99, 102, 241)
        doc.rect(20, 40, 40, 20, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.text(totalProducts.toString(), 40, 52, { align: 'center' })
        doc.setFontSize(8)
        doc.text('Productos', 40, 57, { align: 'center' })

        doc.setFillColor(20, 184, 166)
        doc.rect(70, 40, 40, 20, 'F')
        doc.setFontSize(18)
        doc.text(totalStock.toString(), 90, 52, { align: 'center' })
        doc.setFontSize(8)
        doc.text('Stock Total', 90, 57, { align: 'center' })

        doc.setFillColor(245, 158, 11)
        doc.rect(120, 40, 40, 20, 'F')
        doc.setFontSize(18)
        doc.text(`$${(totalValue / 1000).toFixed(1)}K`, 140, 52, { align: 'center' })
        doc.setFontSize(8)
        doc.text('Valor Total', 140, 57, { align: 'center' })

        doc.setFillColor(239, 68, 68)
        doc.rect(170, 40, 20, 20, 'F')
        doc.setFontSize(18)
        doc.text(lowStock.toString(), 180, 52, { align: 'center' })
        doc.setFontSize(8)
        doc.text('Alertas', 180, 57, { align: 'center' })

        // Mini bar chart - Top 5 products by stock
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('Top 5 Productos por Stock', 20, 75)

        const top5Stock = [...products].sort((a, b) => b.stock - a.stock).slice(0, 5)
        const maxStock = Math.max(...top5Stock.map(p => p.stock), 1)

        let barY = 82
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        top5Stock.forEach((product) => {
            const barWidth = (product.stock / maxStock) * 120
            doc.setFillColor(20, 184, 166)
            doc.rect(70, barY, barWidth, 6, 'F')
            doc.text(product.name.substring(0, 25), 20, barY + 4)
            doc.setFont('helvetica', 'bold')
            doc.text(product.stock.toString(), 192, barY + 4, { align: 'right' })
            doc.setFont('helvetica', 'normal')
            barY += 9
        })

        // Table headers
        const tableStartY = 130
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setFillColor(240, 240, 240)
        doc.rect(20, tableStartY - 5, 170, 8, 'F')
        doc.setTextColor(0, 0, 0)
        doc.text('Código', 22, tableStartY)
        doc.text('Producto', 52, tableStartY)
        doc.text('Precio', 122, tableStartY)
        doc.text('Stock', 147, tableStartY)
        doc.text('Valor', 172, tableStartY)

        doc.setFont('helvetica', 'normal')

        // Products
        let yPos = tableStartY + 8
        products.forEach((product) => {
            if (yPos > 270) {
                doc.addPage()
                yPos = 20

                // Repeat headers
                doc.setFont('helvetica', 'bold')
                doc.setFillColor(240, 240, 240)
                doc.rect(20, yPos - 5, 170, 8, 'F')
                doc.text('Código', 22, yPos)
                doc.text('Producto', 52, yPos)
                doc.text('Precio', 122, yPos)
                doc.text('Stock', 147, yPos)
                doc.text('Valor', 172, yPos)
                doc.setFont('helvetica', 'normal')
                yPos += 8
            }

            // Color for low stock
            if (product.stock <= product.min_stock) {
                doc.setTextColor(220, 38, 38)
            }

            doc.text(product.code.substring(0, 12), 22, yPos)
            doc.text(product.name.substring(0, 25), 52, yPos)
            doc.text(`$${product.price.toFixed(2)}`, 122, yPos)
            doc.text(`${product.stock} ${product.unit}`, 147, yPos)
            doc.text(`$${(product.price * product.stock).toFixed(2)}`, 172, yPos)

            doc.setTextColor(0, 0, 0)
            yPos += 6
        })

        // Save
        doc.save(`inventario_completo_${new Date().toISOString().split('T')[0]}.pdf`)
    },

    // Export sales to PDF
    exportSalesPDF: (sales: Sale[]) => {
        const doc = new jsPDF()
        const company = companyService.getSettings()

        // Logo if exists
        if (company.logo) {
            try {
                doc.addImage(company.logo, 'PNG', 15, 10, 25, 25)
            } catch (e) {
                console.error('Error adding logo:', e)
            }
        }

        // Header
        doc.setFontSize(20)
        doc.setFont('helvetica', 'bold')
        doc.text('REPORTE DE VENTAS', 105, 20, { align: 'center' })

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(`Generado: ${new Date().toLocaleDateString('es-MX')} ${new Date().toLocaleTimeString('es-MX')}`, 105, 28, { align: 'center' })

        // Summary with visual stats
        const totalSales = sales.reduce((sum, s) => sum + s.total, 0)
        const totalDiscount = sales.reduce((sum, s) => sum + s.discount, 0)
        const avgSale = sales.length > 0 ? totalSales / sales.length : 0

        // Stats boxes with colors
        doc.setFillColor(34, 197, 94)
        doc.rect(20, 40, 42, 20, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.text(sales.length.toString(), 41, 52, { align: 'center' })
        doc.setFontSize(8)
        doc.text('Total Ventas', 41, 57, { align: 'center' })

        doc.setFillColor(99, 102, 241)
        doc.rect(68, 40, 45, 20, 'F')
        doc.setFontSize(18)
        doc.text(`$${(totalSales / 1000).toFixed(1)}K`, 90, 52, { align: 'center' })
        doc.setFontSize(8)
        doc.text('Ingresos', 90, 57, { align: 'center' })

        doc.setFillColor(234, 88, 12)
        doc.rect(119, 40, 45, 20, 'F')
        doc.setFontSize(18)
        doc.text(`$${avgSale.toFixed(0)}`, 141, 52, { align: 'center' })
        doc.setFontSize(8)
        doc.text('Promedio', 141, 57, { align: 'center' })

        doc.setFillColor(236, 72, 153)
        doc.rect(170, 40, 20, 20, 'F')
        doc.setFontSize(18)
        doc.text(`$${(totalDiscount / 100).toFixed(0)}`, 180, 52, { align: 'center' })
        doc.setFontSize(8)
        doc.text('Desc.', 180, 57, { align: 'center' })

        // Payment methods pie chart (visual bars)
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('Distribución por Método de Pago', 20, 75)

        const paymentMethods = sales.reduce((acc, sale) => {
            acc[sale.payment_method] = (acc[sale.payment_method] || 0) + sale.total
            return acc
        }, {} as Record<string, number>)

        const paymentColors = {
            'cash': [34, 197, 94],
            'card': [59, 130, 246],
            'transfer': [168, 85, 247]
        }

        let barY = 82
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        Object.entries(paymentMethods).forEach(([method, total]) => {
            const percentage = (total / totalSales) * 100
            const barWidth = (percentage / 100) * 120
            const color = paymentColors[method as keyof typeof paymentColors] || [156, 163, 175]

            doc.setFillColor(color[0], color[1], color[2])
            doc.rect(70, barY, barWidth, 6, 'F')
            doc.text(method.charAt(0).toUpperCase() + method.slice(1), 20, barY + 4)
            doc.setFont('helvetica', 'bold')
            doc.text(`${percentage.toFixed(1)}% · $${total.toFixed(0)}`, 192, barY + 4, { align: 'right' })
            doc.setFont('helvetica', 'normal')
            barY += 9
        })

        // Table headers
        const tableStartY = 130
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setFillColor(240, 240, 240)
        doc.rect(20, tableStartY - 5, 170, 8, 'F')
        doc.setTextColor(0, 0, 0)
        doc.text('#', 22, tableStartY)
        doc.text('Fecha', 37, tableStartY)
        doc.text('Cliente', 72, tableStartY)
        doc.text('Items', 117, tableStartY)
        doc.text('Total', 142, tableStartY)
        doc.text('Pago', 172, tableStartY)

        doc.setFont('helvetica', 'normal')

        // Sales
        let yPos = tableStartY + 8
        sales.forEach((sale) => {
            if (yPos > 270) {
                doc.addPage()
                yPos = 20

                // Repeat headers
                doc.setFont('helvetica', 'bold')
                doc.setFillColor(240, 240, 240)
                doc.rect(20, yPos - 5, 170, 8, 'F')
                doc.text('#', 22, yPos)
                doc.text('Fecha', 37, yPos)
                doc.text('Cliente', 72, yPos)
                doc.text('Items', 117, yPos)
                doc.text('Total', 142, yPos)
                doc.text('Pago', 172, yPos)
                doc.setFont('helvetica', 'normal')
                yPos += 8
            }

            const date = sale.created_at ? new Date(sale.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' }) : ''

            doc.text(`#${sale.id}`, 22, yPos)
            doc.text(date, 37, yPos)
            doc.text((sale.customer_name || 'N/A').substring(0, 20), 72, yPos)
            doc.text(sale.items.length.toString(), 117, yPos)
            doc.setFont('helvetica', 'bold')
            doc.text(`$${sale.total.toFixed(2)}`, 142, yPos)
            doc.setFont('helvetica', 'normal')
            doc.text(sale.payment_method, 172, yPos)

            yPos += 6
        })

        // Save
        doc.save(`ventas_${new Date().toISOString().split('T')[0]}.pdf`)
    },

    // Export low stock products to PDF
    exportLowStockPDF: (products: Product[]) => {
        const lowStock = products.filter(p => p.stock <= p.min_stock)
        const doc = new jsPDF()

        // Header
        doc.setFontSize(20)
        doc.setTextColor(200, 0, 0)
        doc.text('⚠ PRODUCTOS BAJO STOCK', 105, 20, { align: 'center' })
        doc.setTextColor(0, 0, 0)

        doc.setFontSize(10)
        doc.text(`Generado: ${new Date().toLocaleDateString('es-MX')} ${new Date().toLocaleTimeString('es-MX')}`, 105, 30, { align: 'center' })

        // Summary
        doc.setFontSize(11)
        doc.setTextColor(150, 0, 0)
        doc.text(`⚠ ${lowStock.length} productos requieren atención`, 105, 45, { align: 'center' })
        doc.setTextColor(0, 0, 0)

        // Table headers
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text('Código', 20, 60)
        doc.text('Producto', 50, 60)
        doc.text('Stock', 120, 60)
        doc.text('Mín', 145, 60)
        doc.text('Faltante', 165, 60)

        doc.line(20, 62, 190, 62)
        doc.setFont('helvetica', 'normal')

        // Products
        let yPos = 70
        lowStock.forEach((product) => {
            if (yPos > 270) {
                doc.addPage()
                yPos = 20

                // Repeat headers
                doc.setFont('helvetica', 'bold')
                doc.text('Código', 20, yPos)
                doc.text('Producto', 50, yPos)
                doc.text('Stock', 120, yPos)
                doc.text('Mín', 145, yPos)
                doc.text('Faltante', 165, yPos)
                doc.line(20, yPos + 2, 190, yPos + 2)
                doc.setFont('helvetica', 'normal')
                yPos += 10
            }

            const missing = product.min_stock - product.stock
            doc.setTextColor(200, 0, 0)

            doc.text(product.code.substring(0, 12), 20, yPos)
            doc.text(product.name.substring(0, 25), 50, yPos)
            doc.text(`${product.stock} ${product.unit}`, 120, yPos)
            doc.text(product.min_stock.toString(), 145, yPos)
            doc.text(missing.toString(), 165, yPos)

            doc.setTextColor(0, 0, 0)
            yPos += 7
        })

        // Footer warning
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.text('* Se recomienda reabastecer estos productos lo antes posible', 105, 285, { align: 'center' })

        // Save
        doc.save(`productos_bajo_stock_${new Date().toISOString().split('T')[0]}.pdf`)
    },
}
