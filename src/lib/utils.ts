import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getImageSrc(imagePath?: string) {
    if (!imagePath) return undefined
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath
    // Asumimos que es un archivo local gestionado por CeroCloud
    // Removemos posibles barras invertidas de Windows si se colaron
    const cleanPath = imagePath.split(/[\\/]/).pop()
    return `cerocloud-image://${cleanPath}`
}
