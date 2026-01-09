import { z } from 'zod'

export const productSchema = z.object({
    code: z.string().min(1, 'El código es obligatorio'),
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    description: z.string().optional(),
    category: z.string().default('General'),
    image: z.string().optional(),
    price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
    cost: z.coerce.number().min(0, 'El costo no puede ser negativo').optional().default(0),
    stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo'),
    min_stock: z.coerce.number().int().min(0, 'El stock mínimo no puede ser negativo').default(0),
    unit: z.enum(['unidad', 'kg', 'g', 'l', 'ml', 'm', 'caja', 'paquete']).default('unidad'),
    supplier_id: z.coerce.number().optional(),
})

export type ProductFormValues = z.infer<typeof productSchema>
