# Guía de Desarrollo - CeroCloud

## 🚀 Ejecutar en Modo Desarrollo

### Opción 1: Todo en uno (Recomendado)

```bash
npm run dev
```

Este comando:
- Compila los archivos de Electron (main.ts y preload.ts)
- Inicia el servidor de Vite en http://localhost:5173
- Abre automáticamente la ventana de Electron
- Habilita hot reload para cambios en código

**Nota:** La ventana de Electron se abrirá automáticamente. Los mensajes de DevTools son normales y pueden ignorarse.

### Opción 2: Desarrollo separado

Si necesitas más control:

```bash
# Terminal 1: Iniciar Vite
npx vite

# Terminal 2: Iniciar Electron (después de que Vite esté corriendo)
npx electron .
```

## 🔧 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Modo desarrollo con hot reload |
| `npm run build` | Build completo para producción |
| `npm run build:win` | Generar ejecutable para Windows |
| `npm run build:mac` | Generar ejecutable para macOS |
| `npm run build:linux` | Generar ejecutable para Linux |
| `npm run lint` | Ejecutar ESLint |
| `npm run type-check` | Verificar tipos TypeScript |
| `npm run preview` | Preview del build de producción |

## 📁 Estructura del Proyecto

```
CeroCloud/
├── electron/               # Proceso principal de Electron
│   ├── main/              # Main process
│   │   └── main.ts       # Entry point del main process
│   ├── preload/          # Preload scripts
│   │   └── preload.ts    # contextBridge API
│   └── assets/           # Iconos de la aplicación
├── src/                   # Frontend (Renderer process)
│  ├── app/               # Configuración de la app
│   │   ├── App.tsx       # Componente raíz
│   │   └── routes.tsx    # Definición de rutas
│   ├── components/       # Componentes reutilizables
│   │   └── layout/       # Componentes de layout
│   ├── features/         # Módulos del sistema
│   │   ├── dashboard/
│   │   ├── inventory/
│   │   ├── sales/
│   │   └── reports/
│   ├── lib/              # Utilidades
│   ├── styles/           # Estilos globales
│   └── main.tsx          # Entry point de React
├── database/             # Base de datos local
│   └── backups/          # Respaldos automáticos
└── public/               # Assets estáticos
```

## 🎨 Desarrollo de UI

### Tailwind CSS

Los estilos están configurados con Tailwind CSS. Variables CSS están en `src/styles/globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  /* ... más variables */
}
```

### Modo Oscuro

El proyecto soporta modo oscuro. Toggle en el Header:

```tsx
// Agregar clase 'dark' al html
document.documentElement.classList.toggle('dark')
```

### Iconos

Usamos Lucide React para iconos:

```tsx
import { Package, User } from 'lucide-react'

<Package className="w-5 h-5" />
```

## 🔌 Comunicación IPC

### Desde el Renderer (Frontend)

```tsx
// Acceder a APIs expuestas via preload
const result = await window.electronAPI.db.query('SELECT * FROM products')
```

### Añadir nueva API

1. **Agregar handler en main.ts:**

```typescript
ipcMain.handle('mi-canal', async (event, args) => {
  // Lógica aquí
  return resultado
})
```

2. **Exponer en preload.ts:**

```typescript
contextBridge.exposeInMainWorld('electronAPI', {
  miAPI: () => ipcRenderer.invoke('mi-canal')
})
```

3. **Usar en frontend:**

```typescript
const data = await window.electronAPI.miAPI()
```

## 🗄️ Base de Datos (Pendiente de implementar)

SQLite se configurará con better-sqlite3:

```typescript
// En electron/main/database.ts
import Database from 'better-sqlite3'

const db = new Database('database/cerocloud.db')
```

## 🐛 Debugging

### Renderer Process (Frontend)

- DevTools se abren automáticamente en desarrollo
- `console.log()` aparece en DevTools
- React DevTools disponible

### Main Process (Backend)

- Agregar `console.log()` en main.ts
- El output aparece en la terminal donde ejecutaste `npm run dev`

### Breakpoints

Usa VS Code con la extensión de Debugger for Chrome/Edge.

## ⚠️ Problemas Comunes

### La aplicación no se abre

1. Verificar que no haya otra instancia corriendo
2. Verificar puerto 5173 disponible: `netstat -ano | findstr :5173`
3. Borrar `dist-electron/` y `dist/` y volver a ejecutar

### Hot reload no funciona

1. Guardar el archivo correctamente
2. Verificar que no haya errores de TypeScript
3. Reiniciar el servidor de desarrollo

### Errores de tipos TypeScript

```bash
npm run type-check
```

Esto mostrará todos los errores de tipos sin compilar.

## 📝 Convenciones de Código

### Nombres de Archivos

- Componentes: `PascalCase.tsx` (ej: `Dashboard.tsx`)
- Utilidades: `camelCase.ts` (ej: `utils.ts`)
- Hooks: `use*.ts` (ej: `useProducts.ts`)

### Estructura de Componentes

```tsx
// Imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// Types
interface Props {
  title: string
}

// Component
export function MiComponente({ title }: Props) {
  return <div>{title}</div>
}
```

### Commits

Seguir convención de Conventional Commits:

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formato, punto y coma, etc
refactor: refactorización
test: añadir tests
chore: tasks de mantenimiento
```

## 🚢 Build para Producción

### Windows

```bash
npm run build:win
```

Genera instalador en `release/`

### Requisitos

- Windows: Node.js
- macOS: Xcode Command Line Tools
- Linux: `build-essential`

## 📚 Recursos

- [Electron Docs](https://www.electronjs.org/docs/latest)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**¿Problemas?** Abre un issue en GitHub o consulta la documentación en `docs/`.
