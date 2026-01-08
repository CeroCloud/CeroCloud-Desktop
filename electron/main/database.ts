import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'
import fs from 'fs'
import { Product, Category, Sale, Supplier, SaleItem } from '../../src/types/database'

// Configuración de la Base de Datos
const dbPath = path.join(app.getPath('userData'), 'cerocloud.db')
const db = new Database(dbPath)

// Habilitar WAL (Write-Ahead Logging) para mejor rendimiento y seguridad
db.pragma('journal_mode = WAL')

// ==========================================
// 1. Definición del Esquema (Schema)
// ==========================================

function initSchema() {
  // Tabla: Productos
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        supplier_id INTEGER,
        supplier_name TEXT,
        image TEXT,
        price REAL NOT NULL,
        cost REAL,
        stock INTEGER NOT NULL DEFAULT 0,
        min_stock INTEGER NOT NULL DEFAULT 5,
        unit TEXT DEFAULT 'unidad',
        created_at TEXT,
        updated_at TEXT
    )`)

  // Tabla: Categorías
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at TEXT
    )`)

  // Tabla: Proveedores
  db.exec(`
    CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        contact TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        created_at TEXT
    )`)

  // Tabla: Ventas
  db.exec(`
    CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subtotal REAL NOT NULL,
        tax REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        total REAL NOT NULL,
        payment_method TEXT,
        customer_name TEXT,
        notes TEXT,
        status TEXT DEFAULT 'completed',
        created_at TEXT
    )`)

  // Tabla: Items de Venta
  db.exec(`
    CREATE TABLE IF NOT EXISTS sale_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_code TEXT,
        product_name TEXT,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        subtotal REAL NOT NULL,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
    )`)



  // Índices Estratégicos para Rendimiento
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
    CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
    CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);
  `)

  console.log('✅ Esquema SQLite inicializado con optimizaciones de rendimiento.')
}

// ==========================================
// 2. Lógica de Migración (JSON -> SQLite)
// ==========================================

function migrateFromJSON() {
  const productCount = db.prepare('SELECT count(*) as count FROM products').get() as { count: number }
  if (productCount.count > 0) return

  const jsonPath = path.join(app.getPath('userData'), 'cerocloud-data.json')
  if (fs.existsSync(jsonPath)) {
    console.log('📦 Detectado archivo JSON antiguo. Iniciando migración a SQLite...')
    try {
      const rawData = fs.readFileSync(jsonPath, 'utf8')
      const jsonData = JSON.parse(rawData)

      const insertProduct = db.prepare(`
                INSERT INTO products(id, code, name, description, category, price, cost, stock, min_stock, unit, created_at, updated_at)
  VALUES(@id, @code, @name, @description, @category, @price, @cost, @stock, @min_stock, @unit, @created_at, @updated_at)
            `)

      const insertCategory = db.prepare(`INSERT OR IGNORE INTO categories(id, name, description, created_at) VALUES(@id, @name, @description, @created_at)`)
      const insertSupplier = db.prepare(`INSERT INTO suppliers(id, name, contact, phone, email, address, created_at) VALUES(@id, @name, @contact, @phone, @email, @address, @created_at)`)
      const insertSale = db.prepare(`INSERT INTO sales(id, subtotal, tax, discount, total, payment_method, customer_name, status, created_at) VALUES(@id, @subtotal, @tax, @discount, @total, @payment_method, @customer_name, @status, @created_at)`)
      const insertSaleItem = db.prepare(`INSERT INTO sale_items(sale_id, product_id, product_code, product_name, quantity, unit_price, subtotal) VALUES(@sale_id, @product_id, @product_code, @product_name, @quantity, @unit_price, @subtotal)`)

      const migration = db.transaction(() => {
        if (jsonData.products) {
          for (const p of jsonData.products) {
            insertProduct.run({
              id: p.id, code: p.code, name: p.name, description: p.description || '', category: p.category || '',
              price: p.price, cost: p.cost || 0, stock: p.stock, min_stock: p.min_stock,
              unit: p.unit || 'unidad', created_at: p.created_at || new Date().toISOString(),
              updated_at: p.updated_at || new Date().toISOString()
            })
          }
        }

        if (jsonData.categories) {
          for (const c of jsonData.categories) {
            insertCategory.run({ id: c.id, name: c.name, description: c.description || '', created_at: c.created_at || new Date().toISOString() })
          }
        }

        if (jsonData.suppliers) {
          for (const s of jsonData.suppliers) {
            insertSupplier.run({
              id: s.id, name: s.name, contact: s.contact || '', phone: s.phone || '',
              email: s.email || '', address: s.address || '', created_at: s.created_at || new Date().toISOString()
            })
          }
        }

        if (jsonData.sales) {
          for (const s of jsonData.sales) {
            insertSale.run({
              id: s.id, subtotal: s.subtotal, tax: s.tax, discount: s.discount, total: s.total,
              payment_method: s.payment_method, customer_name: s.customer_name || '',
              status: s.status || 'completed', created_at: s.created_at || new Date().toISOString()
            })

            if (s.items) {
              for (const item of s.items) {
                insertSaleItem.run({
                  sale_id: s.id, product_id: item.product_id || 0,
                  product_code: item.product_code || '', product_name: item.product_name || '',
                  quantity: item.quantity, unit_price: item.unit_price, subtotal: item.subtotal
                })
              }
            }
          }
        }
      })

      migration()
      console.log('✅ Migración completada exitosamente.')
    } catch (error) {
      console.error('❌ Error migrando datos JSON:', error)
    }
  } else {
    initializeDemoData()
  }
}

function initializeDemoData() {
  console.log('📦 Inicializando datos de demostración...')
  const insert = db.prepare(`
        INSERT INTO products(code, name, description, category, price, cost, stock, min_stock, unit, created_at, updated_at)
  VALUES(@code, @name, @description, @category, @price, @cost, @stock, @min_stock, @unit, @created_at, @updated_at)
    `)

  const demoProducts = [
    { code: 'DEMO01', name: 'Laptop HP 15', description: '8GB RAM, 256GB SSD', category: 'Electrónica', price: 599.99, cost: 450.00, stock: 10, min_stock: 2, unit: 'unidad' },
    { code: 'DEMO02', name: 'Mouse Inalámbrico', description: 'Óptico 2.4Ghz', category: 'Accesorios', price: 12.50, cost: 6.00, stock: 50, min_stock: 10, unit: 'unidad' },
    { code: 'DEMO03', name: 'Teclado Mecánico', description: 'RGB Gamer', category: 'Accesorios', price: 45.00, cost: 25.00, stock: 15, min_stock: 5, unit: 'unidad' },
    { code: 'DEMO04', name: 'Monitor 24"', description: 'Full HD IPS', category: 'Electrónica', price: 120.00, cost: 90.00, stock: 5, min_stock: 2, unit: 'unidad' },
    { code: 'DEMO05', name: 'Cable HDMI', description: '2 metros 4K', category: 'Cables', price: 5.99, cost: 1.50, stock: 100, min_stock: 20, unit: 'unidad' }
  ]

  const tx = db.transaction(() => {
    for (const p of demoProducts) {
      insert.run({ ...p, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    }
  })
  tx()
}

// ==========================================
// 3. Operaciones de Base de Datos (Queries)
// ==========================================

export const productQueries = {
  getAll: (): Product[] => {
    return db.prepare('SELECT * FROM products ORDER BY name ASC').all() as Product[]
  },

  getById: (id: number): Product | undefined => {
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id) as Product | undefined
  },

  search: (term: string): Product[] => {
    const pattern = `% ${term}% `
    return db.prepare(`
  SELECT * FROM products 
            WHERE name LIKE ? OR code LIKE ? OR description LIKE ? OR category LIKE ?
    `).all(pattern, pattern, pattern, pattern) as Product[]
  },

  create: (product: Omit<Product, 'id'> & { id?: number }): Product => {
    // Permitir insertar ID explícito (para restauraciones) o NULL (autoincrement)
    const stmt = db.prepare(`
            INSERT INTO products(id, code, name, description, category, price, cost, stock, min_stock, unit, image, supplier_id, created_at, updated_at)
  VALUES(@id, @code, @name, @description, @category, @price, @cost, @stock, @min_stock, @unit, @image, @supplier_id, @created_at, @updated_at)
    `)

    const info = stmt.run({
      ...product,
      id: product.id || null,
      description: product.description || '',
      category: product.category || '',
      cost: product.cost || 0,
      unit: product.unit || 'unidad',
      image: product.image || null,
      supplier_id: product.supplier_id || null,
      created_at: product.created_at || new Date().toISOString(),
      updated_at: product.updated_at || new Date().toISOString()
    })

    return { ...product, id: Number(info.lastInsertRowid) }
  },

  createOrUpdate: (product: Omit<Product, 'id'> & { id?: number }): { product: Product; isNew: boolean } => {
    // Verificar si existe un producto con el mismo código
    const existing = db.prepare('SELECT * FROM products WHERE code = ?').get(product.code) as Product | undefined

    if (existing) {
      // Actualizar producto existente
      const updateStmt = db.prepare(`
        UPDATE products 
        SET name = @name,
    description = @description,
    category = @category,
    price = @price,
    cost = @cost,
    stock = @stock,
    min_stock = @min_stock,
    unit = @unit,
    image = @image,
    supplier_id = @supplier_id,
    updated_at = @updated_at 
        WHERE code = @code
    `)

      updateStmt.run({
        ...product,
        image: product.image || null,
        supplier_id: product.supplier_id || null,
        updated_at: new Date().toISOString()
      })

      return {
        product: { ...existing, ...product, id: existing.id },
        isNew: false
      }
    } else {
      // Crear nuevo producto
      const insertStmt = db.prepare(`
        INSERT INTO products(id, code, name, description, category, price, cost, stock, min_stock, unit, image, supplier_id, created_at, updated_at)
  VALUES(@id, @code, @name, @description, @category, @price, @cost, @stock, @min_stock, @unit, @image, @supplier_id, @created_at, @updated_at)
      `)

      const info = insertStmt.run({
        ...product,
        id: product.id || null,
        description: product.description || '',
        category: product.category || '',
        cost: product.cost || 0,
        unit: product.unit || 'unidad',
        image: product.image || null,
        supplier_id: product.supplier_id || null,
        created_at: product.created_at || new Date().toISOString(),
        updated_at: product.updated_at || new Date().toISOString()
      })

      return {
        product: { ...product, id: Number(info.lastInsertRowid) },
        isNew: true
      }
    }
  },

  update: (id: number, productData: Partial<Product>): Product | null => {
    const fields = Object.keys(productData).filter(key => key !== 'id' && key !== 'created_at')
    if (fields.length === 0) return productQueries.getById(id) || null

    const setClause = fields.map(field => `${field} = @${field} `).join(', ')
    const stmt = db.prepare(`UPDATE products SET ${setClause}, updated_at = @updated_at WHERE id = @id`)

    stmt.run({
      ...productData,
      id,
      updated_at: new Date().toISOString()
    })

    return productQueries.getById(id) || null
  },

  delete: (id: number): boolean => {
    const info = db.prepare('DELETE FROM products WHERE id = ?').run(id)
    return info.changes > 0
  },

  getLowStock: (): Product[] => {
    return db.prepare('SELECT * FROM products WHERE stock <= min_stock ORDER BY stock ASC').all() as Product[]
  }
}

export const categoryQueries = {
  getAll: (): Category[] => {
    return db.prepare('SELECT * FROM categories ORDER BY name ASC').all() as Category[]
  },

  create: (name: string, description?: string, id?: number): Category => {
    const stmt = db.prepare('INSERT INTO categories (id, name, description, created_at) VALUES (?, ?, ?, ?)')
    const info = stmt.run(id || null, name, description || '', new Date().toISOString())
    return { id: Number(info.lastInsertRowid), name, description, created_at: new Date().toISOString() }
  },

  delete: (id: number): boolean => {
    const info = db.prepare('DELETE FROM categories WHERE id = ?').run(id)
    return info.changes > 0
  }
}

export const supplierQueries = {
  getAll: (): Supplier[] => {
    return db.prepare('SELECT * FROM suppliers ORDER BY name ASC').all() as Supplier[]
  },

  getById: (id: number): Supplier | undefined => {
    return db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id) as Supplier | undefined
  },

  create: (supplier: Omit<Supplier, 'id'> & { id?: number }): Supplier => {
    const stmt = db.prepare(`
            INSERT INTO suppliers(id, name, contact, phone, email, address, created_at)
  VALUES(@id, @name, @contact, @phone, @email, @address, @created_at)
        `)
    const info = stmt.run({
      ...supplier,
      id: supplier.id || null,
      contact: supplier.contact || null,
      phone: supplier.phone || null,
      email: supplier.email || null,
      address: supplier.address || null,
      created_at: supplier.created_at || new Date().toISOString()
    })
    return { ...supplier, id: Number(info.lastInsertRowid) }
  },

  update: (id: number, supplierData: Partial<Supplier>): Supplier | null => {
    const fields = Object.keys(supplierData).filter(key => key !== 'id' && key !== 'created_at')
    if (fields.length === 0) return supplierQueries.getById(id) || null

    const setClause = fields.map(field => `${field} = @${field} `).join(', ')
    const stmt = db.prepare(`UPDATE suppliers SET ${setClause} WHERE id = @id`)

    stmt.run({ ...supplierData, id })
    return supplierQueries.getById(id) || null
  },

  delete: (id: number): boolean => {
    const info = db.prepare('DELETE FROM suppliers WHERE id = ?').run(id)
    return info.changes > 0
  }
}

export const saleQueries = {
  getAll: (): Sale[] => {
    const sales = db.prepare('SELECT * FROM sales ORDER BY created_at DESC').all() as Sale[]
    const getItems = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?')

    return sales.map(sale => ({
      ...sale,
      items: getItems.all(sale.id) as SaleItem[]
    }))
  },

  getById: (id: number): Sale | undefined => {
    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(id) as Sale | undefined
    if (!sale) return undefined

    sale.items = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(id) as SaleItem[]
    return sale
  },

  create: (sale: Omit<Sale, 'id'> & { id?: number }): Sale => {
    const createTx = db.transaction(() => {
      // 1. Insertar Venta (Permite restaurar ID, status y fechas originales)
      const insertSale = db.prepare(`
                INSERT INTO sales(id, subtotal, tax, discount, total, payment_method, customer_name, notes, status, created_at)
  VALUES(@id, @subtotal, @tax, @discount, @total, @payment_method, @customer_name, @notes, @status, @created_at)
    `)

      const info = insertSale.run({
        ...sale,
        id: sale.id || null,
        notes: sale.notes || '',
        status: sale.status || 'completed',
        created_at: sale.created_at || new Date().toISOString()
      })
      const saleId = Number(info.lastInsertRowid)

      // 2. Insertar Items y Actualizar Stock
      const insertItem = db.prepare(`
                INSERT INTO sale_items(sale_id, product_id, product_code, product_name, quantity, unit_price, subtotal)
  VALUES(@sale_id, @product_id, @product_code, @product_name, @quantity, @unit_price, @subtotal)
            `)

      const updateStock = db.prepare(`UPDATE products SET stock = stock - @qty WHERE id = @id`)

      // Si estamos restaurando (es decir, proporcionamos ID), TAL VEZ no deberíamos descontar stock de nuevo
      // si el backup ya trae el stock actualizado en los productos.
      // PERO: La restauración borra todo e inserta productos (con su stock del backup) y luego ventas.
      // Si insertamos ventas y descontamos stock, podríamos "doble descontar"?
      // El backup de productos ya tiene el stock final.
      // Si restauramos una venta HISTÓRICA, no deberíamos afectar el stock actual del producto restaurado?
      // RESPUESTA CRÍTICA: Al restaurar, primero se restauran productos (con su stock snapshot del backup).
      // Luego se restauran ventas.
      // Si al restaurar ventas descontamos stock, ¡estaremos restando lo que ya estaba restado!
      // SOLUCIÓN: Si se proporciona un 'id' (significa restauración), NO tocar el stock.
      // Solo descontar stock si es una venta NUEVA (sin id).

      const isRestore = !!sale.id;

      for (const item of sale.items) {
        insertItem.run({
          sale_id: saleId,
          product_id: item.product_id,
          product_code: item.product_code,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal
        })

        if (!isRestore) {
          updateStock.run({ qty: item.quantity, id: item.product_id })
        }
      }

      return { ...sale, id: saleId, status: sale.status || 'completed' } as Sale
    })

    return createTx()
  },

  getTotalSales: (): number => {
    const result = db.prepare('SELECT SUM(total) as total FROM sales WHERE status = "completed"').get() as { total: number }
    return result.total || 0
  },

  getSalesToday: (): Sale[] => {
    const today = new Date().toISOString().split('T')[0]
    const sales = db.prepare('SELECT * FROM sales WHERE created_at LIKE ? ORDER BY created_at DESC').all(`${today}% `) as Sale[]

    const getItems = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?')
    return sales.map(sale => ({
      ...sale,
      items: getItems.all(sale.id) as SaleItem[]
    }))
  },

  getRecent: (limit: number = 10): Sale[] => {
    const sales = db.prepare('SELECT * FROM sales ORDER BY created_at DESC LIMIT ?').all(limit) as Sale[]
    const getItems = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?')
    return sales.map(sale => ({
      ...sale,
      items: getItems.all(sale.id) as SaleItem[]
    }))
  }
}

export const cancelSale = (id: number): Sale | null => {
  const cancelTx = db.transaction(() => {
    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(id) as Sale
    if (!sale || sale.status === 'cancelled') return null

    db.prepare("UPDATE sales SET status = 'cancelled' WHERE id = ?").run(id)

    const items = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(id) as SaleItem[]
    const updateStock = db.prepare('UPDATE products SET stock = stock + @qty WHERE id = @id')

    for (const item of items) {
      updateStock.run({ qty: item.quantity, id: item.product_id })
    }

    return db.prepare('SELECT * FROM sales WHERE id = ?').get(id) as Sale
  })

  const result = cancelTx()
  if (result) {
    result.items = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(id) as SaleItem[]
  }
  return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function restoreDatabase(data: any) {
  const restoreTx = db.transaction(() => {
    console.log('🔄 Iniciando restauración de base de datos...')

    // 1. Limpiar todo
    db.prepare('DELETE FROM sale_items').run()
    db.prepare('DELETE FROM sales').run()
    db.prepare('DELETE FROM products').run()
    db.prepare('DELETE FROM categories').run()
    db.prepare('DELETE FROM suppliers').run()
    db.prepare('DELETE FROM sqlite_sequence').run()

    // Prepared Statements
    const insertSupplier = db.prepare(`
        INSERT INTO suppliers(id, name, contact, phone, email, address, created_at)
  VALUES(@id, @name, @contact, @phone, @email, @address, @created_at)
    `)

    const insertCategory = db.prepare(`
        INSERT INTO categories(id, name, description, created_at)
  VALUES(@id, @name, @description, @created_at)
    `)

    const insertProduct = db.prepare(`
        INSERT INTO products(id, code, name, description, category, price, cost, stock, min_stock, unit, image, supplier_id, created_at, updated_at)
  VALUES(@id, @code, @name, @description, @category, @price, @cost, @stock, @min_stock, @unit, @image, @supplier_id, @created_at, @updated_at)
    `)

    const insertSale = db.prepare(`
        INSERT INTO sales(id, subtotal, tax, discount, total, payment_method, customer_name, notes, status, created_at)
  VALUES(@id, @subtotal, @tax, @discount, @total, @payment_method, @customer_name, @notes, @status, @created_at)
    `)

    const insertSaleItem = db.prepare(`
        INSERT INTO sale_items(sale_id, product_id, product_code, product_name, quantity, unit_price, subtotal)
  VALUES(@sale_id, @product_id, @product_code, @product_name, @quantity, @unit_price, @subtotal)
    `)

    // 2. Restaurar Proveedores
    if (data.suppliers) {
      for (const s of data.suppliers) {
        insertSupplier.run({
          id: s.id, name: s.name, contact: s.contact || '', phone: s.phone || '',
          email: s.email || '', address: s.address || '', created_at: s.created_at || new Date().toISOString()
        })
      }
    }

    // 3. Restaurar Categorías
    if (data.categories) {
      for (const c of data.categories) {
        insertCategory.run({
          id: c.id, name: c.name, description: c.description || '', created_at: c.created_at || new Date().toISOString()
        })
      }
    }

    // 4. Restaurar Productos
    if (data.products) {
      for (const p of data.products) {
        insertProduct.run({
          id: p.id, code: p.code, name: p.name, description: p.description || '', category: p.category || '',
          price: p.price, cost: p.cost || 0, stock: p.stock, min_stock: p.min_stock,
          unit: p.unit || 'unidad', image: p.image || null, supplier_id: p.supplier_id || null,
          created_at: p.created_at || new Date().toISOString(),
          updated_at: p.updated_at || new Date().toISOString()
        })
      }
    }

    // 5. Restaurar Ventas
    if (data.sales) {
      for (const s of data.sales) {
        insertSale.run({
          id: s.id, subtotal: s.subtotal, tax: s.tax, discount: s.discount, total: s.total,
          payment_method: s.payment_method, customer_name: s.customer_name || '',
          notes: s.notes || '', status: s.status || 'completed',
          created_at: s.created_at || new Date().toISOString()
        })

        if (s.items) {
          for (const item of s.items) {
            insertSaleItem.run({
              sale_id: s.id, product_id: item.product_id || 0,
              product_code: item.product_code || '', product_name: item.product_name || '',
              quantity: item.quantity, unit_price: item.unit_price, subtotal: item.subtotal
            })
          }
        }
      }
    }
  })

  restoreTx()
  console.log('✅ Restauración completada exitosamente.')
}

export function clearAll() {
  const clearTx = db.transaction(() => {
    db.prepare('DELETE FROM sale_items').run()
    db.prepare('DELETE FROM sales').run()
    db.prepare('DELETE FROM products').run()
    db.prepare('DELETE FROM categories').run()
    db.prepare('DELETE FROM suppliers').run()
    db.prepare('DELETE FROM sqlite_sequence').run()
  })
  clearTx()
  console.log('✅ Base de datos limpiada completamente')
}

export function initializeDatabase() {
  initSchema()
  try {
    migrateFromJSON()
  } catch (e) {
    console.error('Error durante la migración/inicialización:', e)
  }
  console.log(`✅ Base de datos SQLite activa en: ${dbPath} `)
}

export function closeDatabase() {
  db.close()
  console.log('✅ Conexión SQLite cerrada.')
}
