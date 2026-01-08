/* eslint-disable @typescript-eslint/no-explicit-any */
import { createRoot } from 'react-dom/client'
import { Sale, CompanySettings } from '@/types/database'
import { InvoiceTemplate } from '@/components/print/InvoiceTemplate'
import { ReportTemplate } from '@/components/print/ReportTemplate'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export const pdfGenerator = {
    generateInvoice: async (sale: Sale, settings: CompanySettings) => {
        // Create a temporary container
        const container = document.createElement('div')
        container.style.position = 'absolute'
        container.style.left = '-9999px'
        container.style.top = '0'
        document.body.appendChild(container)

        try {
            // Render the template
            const root = createRoot(container)
            // Wrap within another div to ensure styles are captured correctly
            // Important: We need to wait for the render to complete.
            // Since createRoot is async in practice for effects, we use a promise wrapper or just a timeout.

            await new Promise<void>((resolve) => {
                root.render(
                    <div className="pdf-container">
                        <InvoiceTemplate sale={sale} settings={settings} />
                    </div>
                )
                // Give it a moment to paint logic and load images
                setTimeout(resolve, 800)
            })

            // Find the element to capture
            const element = container.querySelector('#invoice-template') as HTMLElement
            if (!element) throw new Error('Template element not found')

            // Capture using html2canvas
            const canvas = await html2canvas(element, {
                scale: 2, // Higher scale for better quality
                useCORS: true, // Allow loading cross-origin images if any
                logging: false,
                backgroundColor: '#ffffff'
            })

            // Generate PDF
            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const imgProps = pdf.getImageProperties(imgData)
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(`factura_${sale.id}_${new Date().toISOString().split('T')[0]}.pdf`)

            // Cleanup
            root.unmount()
        } catch (error) {
            console.error('Error generating PDF:', error)
            throw error // Re-throw to handle in UI
        } finally {
            if (document.body.contains(container)) {
                document.body.removeChild(container)
            }
        }
    },

    // New General Report Generator
    generateReport: async (
        title: string,
        subtitle: string,
        data: any[],
        type: 'sales' | 'inventory' | 'low-stock' | 'daily-closing',
        settings: CompanySettings,
        range?: string
    ) => {
        // Create invisible temporary container for rendering
        const reportContainer = document.createElement('div')
        reportContainer.id = 'report-render-target'
        reportContainer.style.position = 'fixed'
        reportContainer.style.top = '0'
        reportContainer.style.left = '0'
        reportContainer.style.opacity = '0' // Invisible
        reportContainer.style.pointerEvents = 'none'
        reportContainer.style.zIndex = '-9999'

        // Base styles
        reportContainer.style.backgroundColor = '#ffffff'
        reportContainer.style.width = '1000px'

        document.body.appendChild(reportContainer)

        // Pagination Logic
        const ITEMS_PER_PAGE = 5
        const chunks: any[][] = []
        if (data.length === 0) {
            chunks.push([])
        } else {
            for (let i = 0; i < data.length; i += ITEMS_PER_PAGE) {
                chunks.push(data.slice(i, i + ITEMS_PER_PAGE))
            }
        }

        try {
            const root = createRoot(reportContainer)
            await new Promise<void>((resolve) => {
                root.render(
                    <div style={{ width: '1000px', backgroundColor: '#ffffff' }}>
                        {chunks.map((chunk, index) => (
                            <div key={index} id={`report-page-${index}`} className="mb-8">
                                <ReportTemplate
                                    title={title}
                                    subtitle={subtitle}
                                    data={chunk}
                                    allData={data} // Pass full data for consistent totals
                                    pageInfo={{ current: index + 1, total: chunks.length }}
                                    type={type}
                                    settings={settings}
                                    range={range}
                                />
                            </div>
                        ))}
                    </div>
                )
                // Wait for rendering (images, etc.)
                setTimeout(resolve, 2000)
            })

            const pdf = new jsPDF('p', 'mm', 'a4')
            const imgWidth = 210 // A4 Width mm

            // Process each page individually
            for (let i = 0; i < chunks.length; i++) {
                const element = reportContainer.querySelector(`#report-page-${i}`) as HTMLElement
                if (!element) continue

                const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    windowWidth: 1000
                })

                const imgData = canvas.toDataURL('image/png')
                const imgHeight = (canvas.height * imgWidth) / canvas.width

                if (i > 0) pdf.addPage()
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
            }

            const filenameMap: Record<string, string> = {
                'sales': 'Ventas',
                'inventory': 'Inventario',
                'low-stock': 'StockBajo',
                'daily-closing': 'Reporte'
            }
            const filenamePrefix = filenameMap[type] || 'Reporte'
            const dateStr = new Date().toLocaleDateString('es-MX').replace(/\//g, '-')

            pdf.save(`${filenamePrefix}_${dateStr}.pdf`)

            // Cleanup
            root.unmount()

        } catch (error) {
            console.error('Error generating PDF:', error)
            throw error
        } finally {
            if (document.body.contains(reportContainer)) {
                document.body.removeChild(reportContainer)
            }
        }
    }
}
