<div align="center">

# 🚀 CeroCloud

**Sistema Integral de Ventas e Inventario de Escritorio**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/CeroCloud/CeroCloud-Desktop/releases/tag/v1.0.0)
[![License: MIT + Commons Clause](https://img.shields.io/badge/License-MIT%20%2B%20Commons%20Clause-orange.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org)
[![Electron](https://img.shields.io/badge/Electron-28.x-47848F?logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)

*Aplicación de escritorio multiplataforma para la gestión de inventario y ventas, diseñada para funcionar 100% de forma local y gratuita.*

[Características](#-características) • [Instalación](#-instalación-rápida) • [Documentación](#-documentación) • [Roadmap](#️-roadmap) • [Contribuir](#-contribuir)

</div>

---

## 🎉 Versión Actual: 1.0.0 - Sistema Completo de Gestión

**Lanzamiento:** 8 de Enero, 2026

### 🆕 Novedades Destacadas:
- 🛡️ **Backups Cifrados AES-256** - Protección de nivel empresarial para tus datos
- 🎨 **Interfaz Premium "Glassmorphism"** - Diseño moderno con efectos visuales inmersivos  
- ☁️ **Integración con Google Drive y Dropbox** - Guías visuales para respaldo en la nube
- 🖱️ **Restauración Drag & Drop** - Arrastra tu backup y recupera tus datos en segundos
- 📊 **Pre-visualización de Estadísticas** - Ve qué contiene un backup antes de restaurarlo

**[📥 Descargar v1.0.0](https://github.com/CeroCloud/CeroCloud-Desktop/releases/tag/v1.0.0)** • **[📋 Ver Changelog Completo](changelog.md)**

---

## 📖 Descripción

**CeroCloud** es una solución moderna y profesional para pequeños negocios que necesitan gestionar inventario, ventas y reportes **sin depender de internet, servidores en la nube o suscripciones mensuales**.

Todos los datos se almacenan localmente en tu computadora, garantizando:
- ✅ **Control total** de tu información
- ✅ **Privacidad absoluta** de datos sensibles
- ✅ **Costos cero** de infraestructura
- ✅ **Funcionamiento offline** completo

---

## ✨ Características

### 🎯 Funcionalidades Principales

- **Dashboard Analítico** - Visualiza ingresos, egresos y KPIs en tiempo real
- **Gestión de Inventario** - Catálogo completo con categorías, proveedores y alertas de stock
- **Punto de Venta (POS)** - Carrito rápido con múltiples métodos de pago
- **Reportes y Exportación** - PDFs de facturas, exportación CSV/Excel profesional
- **Seguridad Premium** - Backups cifrados (AES-256), integración con Google Drive/Dropbox y restauración visual drag-and-drop

### 🏆 Ventajas Competitivas

<div align="center">

| Característica | CeroCloud | Competidores Cloud |
|----------------|-----------|-------------------|
| **Costo mensual** | $0 | $10-50/mes |
| **Funciona sin internet** | ✅ Sí | ❌ No |
| **Privacidad de datos** | ✅ 100% local | ⚠️ En servidores externos |
| **Instalación** | Simple ejecutable | Navegador web |
| **Velocidad** | ⚡ Nativa | 🐢 Depende de conexión |

</div>

---

## 🛠️ Stack Tecnológico

<div align="center">

| Capa | Tecnología |
|------|------------|
| **Runtime Desktop** | [Electron.js](https://www.electronjs.org/) |
| **Bundler** | [Vite](https://vitejs.dev/) |
| **Frontend** | [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Estilos** | [Tailwind CSS](https://tailwindcss.com/) |
| **Componentes UI** | [Shadcn/UI](https://ui.shadcn.com/) + [Lucide Icons](https://lucide.dev/) |
| **Base de Datos** | [SQLite](https://www.sqlite.org/) (better-sqlite3) |

</div>

**[Ver detalles completos del stack →](docs/TECH_STACK.md)**

---

## 🚀 Instalación Rápida

### Prerrequisitos

- **Node.js** v20.0.0 o superior
- **npm** v10.0.0 o superior

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/CeroCloud/CeroCloud-Desktop.git

# Navegar al directorio
cd CeroCloud-Desktop

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

**[Guía detallada de instalación →](docs/GETTING_STARTED.md)**

---

## 🔄 Desarrollo y Contribución

Este proyecto usa **Gitflow** para el desarrollo:

- **`main`** - Código en producción (releases oficiales)
- **`develop`** - Rama de desarrollo activo
- **`feature/*`** - Nuevas características
- **`hotfix/*`** - Correcciones urgentes
- **`release/*`** - Preparación de versiones

**📖 Consulta la guía completa:** [docs/GITFLOW.md](docs/GITFLOW.md)  
**🤝 Guía de contribución:** [CONTRIBUTING.md](CONTRIBUTING.md)

### Inicio Rápido para Contribuir

```bash
# Crear una nueva feature
git checkout develop
git checkout -b feature/mi-caracteristica

# O usa el helper script (PowerShell)
.\.github\gitflow-helper.ps1 feature mi-caracteristica

# O en Linux/Mac
./.github/gitflow-helper.sh feature mi-caracteristica
```

---

## 💻 Desarrollo

¿Quieres contribuir o ejecutar el proyecto en modo desarrollo?

```bash
# Ejecutar en modo desarrollo
npm run dev
```

La aplicación se abrirá automáticamente con hot reload habilitado.

**[Guía completa de desarrollo →](docs/DEVELOPMENT.md)**

---

## 📸 Capturas

<div align="center">

### Dashboard Principal

![Dashboard](screenshots/dashboard.png)

*Vista general con estadísticas en tiempo real*

### Gestión de Inventario

![Inventario](screenshots/inventory.png)

*Catálogo completo de productos con búsqueda y filtros*

### Punto de Venta

![POS](screenshots/pos.png)

*Interfaz rápida para registrar ventas*

### Reportes y Análisis

![Reportes](screenshots/reports.png)

*Estadísticas detalladas y exportación de datos*

### Configuración

![Settings](screenshots/settings.png)

*Panel de configuración y personalización*

</div>

---

## 📚 Documentación

<div align="center">

| Documento | Descripción |
|-----------|-------------|
| [**ENUNCIADO_PROYECTO.md**](docs/ENUNCIADO_PROYECTO.md) | Visión general y objetivos del proyecto |
| [**ARCHITECTURE.md**](docs/ARCHITECTURE.md) | Arquitectura técnica y estructura de carpetas |
| [**TECH_STACK.md**](docs/TECH_STACK.md) | Detalles de tecnologías utilizadas |
| [**GETTING_STARTED.md**](docs/GETTING_STARTED.md) | Guía de inicio para desarrolladores |
| [**Roadmap.md**](Roadmap.md) | Plan de desarrollo por fases |
| [**CONTRIBUTING.md**](CONTRIBUTING.md) | Guía para contribuir al proyecto |

</div>

---

## 🗺️ Roadmap

El proyecto está organizado en fases progresivas:

### 🟢 Fase 0 - Preparación ✅ (Completada)
- Definición de arquitectura
- Documentación inicial
- Stack tecnológico definido

### 🔵 Fase 1 - Base del Sistema (En desarrollo)
- Configuración de Electron + Vite + React
- Layout principal
- CRUD de productos
- Integración SQLite

### 🟡 Fase 2 - Ventas y POS
- Carrito de ventas
- Registro de transacciones
- Control de stock

### 🟠 Fase 3 - Reportes y Backups
- Exportación PDF/CSV
- Sistema de backups

### 🟣 Fase 4 - UX Avanzado
- Dashboard con gráficas
- Modo oscuro/claro
- Optimizaciones

**[Ver roadmap completo →](Roadmap.md)**

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Este es un proyecto de código abierto.

### Cómo contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

**[Guía completa de contribución →](CONTRIBUTING.md)**

---

## 📄 Licencia

<div align="center">

Este proyecto está bajo la **MIT License con Commons Clause**.

### 🔓 Lo que esto significa:

</div>

- ✅ **Uso gratuito**: Puedes usar CeroCloud en tu negocio sin pagar nada
- ✅ **Código visible**: El código fuente está disponible en GitHub para estudio y modificación
- ✅ **Modificaciones**: Puedes adaptar el software a tus necesidades
- ❌ **No venta**: No puedes vender este software ni usarlo en servicios comerciales de pago

<div align="center">

Ver [LICENSE](LICENSE) para el texto legal completo.

**¿Eres consultor/técnico?** Contacta a [daanieel123@outlook.com](mailto:daanieel123@outlook.com)

</div>

---

## 🙏 Agradecimientos

<div align="center">

Construido con las mejores herramientas de código abierto:

[Electron](https://www.electronjs.org/) • [React](https://react.dev/) • [Tailwind CSS](https://tailwindcss.com/) • [Shadcn/UI](https://ui.shadcn.com/) • [SQLite](https://www.sqlite.org/)

</div>

---

<div align="center">

**[⭐ Dale una estrella si este proyecto te resulta útil ⭐](https://github.com/CeroCloud/CeroCloud-Desktop)**

Hecho con ❤️ para pequeños negocios

</div>
