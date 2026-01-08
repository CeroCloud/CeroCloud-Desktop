import { ipcMain, app } from 'electron'
import path from 'path'
import fs from 'fs'
import { productQueries, categoryQueries, saleQueries, supplierQueries, cancelSale, clearAll } from './database'

export function registerIpcHandlers() {
    // Database Utils
    ipcMain.handle('database:clearAll', () => {
        try {
            clearAll()
            return { success: true }
        } catch (error) {
            console.error('Error clearing database:', error)
            return { success: false, error: String(error) }
        }
    })


    // Products
    ipcMain.handle('products:getAll', () => {
        return productQueries.getAll()
    })

    ipcMain.handle('products:getById', (_event, id: number) => {
        return productQueries.getById(id)
    })

    ipcMain.handle('products:search', (_event, term: string) => {
        return productQueries.search(term)
    })

    ipcMain.handle('products:create', (_event, product) => {
        return productQueries.create(product)
    })

    ipcMain.handle('products:createOrUpdate', (_event, product) => {
        return productQueries.createOrUpdate(product)
    })

    ipcMain.handle('products:update', (_event, id: number, product) => {
        const result = productQueries.update(id, product)
        return result || { id, ...product }
    })

    ipcMain.handle('products:delete', (_event, id: number) => {
        productQueries.delete(id)
        return { success: true }
    })

    ipcMain.handle('products:getLowStock', () => {
        return productQueries.getLowStock()
    })

    // Image Handlers
    ipcMain.handle('products:saveImage', async (_event, sourcePath: string) => {
        try {
            // Directorio de imágenes en UserData
            const userDataPath = app.getPath('userData')
            const imagesDir = path.join(userDataPath, 'images', 'products')

            // Crear directorio si no existe
            if (!fs.existsSync(imagesDir)) {
                fs.mkdirSync(imagesDir, { recursive: true })
            }

            // Generar nombre único
            const ext = path.extname(sourcePath)
            const filename = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`
            const destPath = path.join(imagesDir, filename)

            // Copiar archivo
            await fs.promises.copyFile(sourcePath, destPath)

            return { success: true, filename }
        } catch (error) {
            console.error('Error saving image:', error)
            return { success: false, error: String(error) }
        }
    })

    ipcMain.handle('products:getImage', async (_event, filename: string) => {
        try {
            const imagePath = path.join(app.getPath('userData'), 'images', 'products', filename)

            if (fs.existsSync(imagePath)) {
                // Leer como buffer para backup
                const buffer = await fs.promises.readFile(imagePath)
                return { success: true, buffer }
            }
            return { success: false, error: 'Image not found' }
        } catch (error) {
            console.error('Error reading image:', error)
            return { success: false, error: String(error) }
        }
    })

    // Restore Image
    ipcMain.handle('products:restoreImage', async (_event, filename: string, buffer: Uint8Array) => {
        try {
            const userDataPath = app.getPath('userData')
            const imagesDir = path.join(userDataPath, 'images', 'products')

            if (!fs.existsSync(imagesDir)) {
                fs.mkdirSync(imagesDir, { recursive: true })
            }

            const destPath = path.join(imagesDir, filename)
            await fs.promises.writeFile(destPath, Buffer.from(buffer))

            return { success: true }
        } catch (error) {
            console.error('Error restoring image:', error)
            return { success: false, error: String(error) }
        }
    })

    // Categories
    ipcMain.handle('categories:getAll', () => {
        return categoryQueries.getAll()
    })

    ipcMain.handle('categories:create', (_event, name: string, description?: string) => {
        return categoryQueries.create(name, description)
    })

    // Sales
    ipcMain.handle('sales:getAll', () => {
        return saleQueries.getAll()
    })

    ipcMain.handle('sales:getById', (_event, id: number) => {
        return saleQueries.getById(id)
    })

    ipcMain.handle('sales:create', (_event, sale) => {
        return saleQueries.create(sale)
    })

    ipcMain.handle('sales:getRecent', (_event, limit?: number) => {
        return saleQueries.getRecent(limit)
    })

    ipcMain.handle('sales:getTotalSales', () => {
        return saleQueries.getTotalSales()
    })

    ipcMain.handle('sales:getSalesToday', () => {
        return saleQueries.getSalesToday()
    })

    ipcMain.handle('sales:cancel', (_event, id: number) => {
        return cancelSale(id)
    })

    // Suppliers
    ipcMain.handle('suppliers:getAll', () => {
        return supplierQueries.getAll()
    })

    ipcMain.handle('suppliers:getById', (_event, id: number) => {
        return supplierQueries.getById(id)
    })

    ipcMain.handle('suppliers:create', (_event, supplier) => {
        return supplierQueries.create(supplier)
    })

    ipcMain.handle('suppliers:update', (_event, id: number, supplier) => {
        const result = supplierQueries.update(id, supplier)
        return result || { id, ...supplier }
    })

    ipcMain.handle('suppliers:delete', (_event, id: number) => {
        supplierQueries.delete(id)
        return { success: true }
    })

    console.log('✅ IPC Handlers registered')
}
