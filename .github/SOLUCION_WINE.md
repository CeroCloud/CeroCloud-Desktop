# 🔧 Solución: Error de Wine en Linux Runner

## ❌ Problema Encontrado

```
⨯ wine is required
⨯ app-builder process failed ERR_ELECTRON_BUILDER_CANNOT_EXECUTE
Exit code: 1
```

**Causa:** GitHub Actions runner de Linux intentaba construir binarios de Windows, pero Wine no estaba instalado.

---

## ✅ Solución Implementada

### Cambio 1: `.releaserc.json`
**Antes:**
```json
"prepareCmd": "npm run type-check && npx vite build && npx electron-builder --win --linux"
```

**Después:**
```json
"prepareCmd": "npm run type-check && npx vite build && npx electron-builder --linux"
```

➜ **Ahora solo construye Linux** en el runner de Ubuntu

---

### Cambio 2: Nuevo Workflow `build-windows.yml`

Creado workflow que se ejecuta **después** de que semantic-release crea el release:

```yaml
on:
  release:
    types: [published]

jobs:
  build-windows:
    runs-on: windows-latest  # ✅ Windows nativo
```

**Flujo:**
1. Semantic-release crea el release con binarios de Linux
2. Se dispara el evento `release.published`
3. Runner de Windows construye los binarios de Windows
4. Los sube automáticamente al mismo release

---

## 🚀 Cómo Funcionará Ahora

### En `develop` branch:

```
1. Push a develop
   ↓
2. CI: Lint + Type Check + Build ✅
   ↓
3. Develop Build:
   - Build Windows (solo validación) ✅
   - Build Ubuntu (solo validación) ✅
   ↓
4. Beta Pre-release (ubuntu-latest):
   - Semantic Release ✅
   - Actualiza changelog ✅
   - Actualiza package.json ✅
   - Construye Linux (AppImage + .deb) ✅
   - Crea release v1.x.x-beta.1 ✅
   ↓
5. Build Windows (windows-latest):
   - Se dispara automáticamente ✅
   - Construye Windows (.exe) ✅
   - Sube a mismo release ✅
```

---

## 📋 Archivos Modificados

1. **`.releaserc.json`**
   - Cambio: `--win --linux` → `--linux`
   - Razón: Solo construir Linux en runner de Linux

2. **`.github/workflows/build-windows.yml`** (NUEVO)
   - Workflow que se ejecuta al publicar un release
   - Construye binarios de Windows en Windows runner
   - Sube automáticamente al release

---

## 🧪 Próximos Pasos

```powershell
# Commitear los cambios
git add .releaserc.json .github/workflows/build-windows.yml
git commit -m "fix: separar build de Windows en workflow dedicado

- Remover --win de semantic-release (solo Linux)
- Crear build-windows.yml para construir Windows después del release
- Esto evita el error de Wine en Linux runner"

# Push
git push origin develop
```

---

## 🎯 Resultado Esperado

Cuando hagas push a `develop`:

1. **Beta Pre-release** creará:
   - ✅ `v1.1.1-beta.1` tag
   - ✅ Release en GitHub
   - ✅ `CeroCloud-1.1.1-beta.1.AppImage` (Linux)
   - ✅ `cerocloud_1.1.1-beta.1_amd64.deb` (Linux)
   - ✅ `latest-linux.yml` (auto-update)

2. **Build Windows** (automático después) agregará:
   - ✅ `CeroCloud-Setup-1.1.1-beta.1.exe` (Windows)
   - ✅ `latest.yml` (auto-update)

---

## ⏱️ Tiempo Estimado

- Semantic Release + Linux build: ~5 minutos
- Windows build (después): ~3-5 minutos
- **Total: ~10 minutos** para tener todos los binarios

---

## 💡 Ventajas de Esta Solución

1. ✅ **No necesita Wine** - cada plataforma en su runner nativo
2. ✅ **Más rápido** - builds en paralelo (después del release)
3. ✅ **Más confiable** - no hay dependencias de emulación
4. ✅ **Fácil de mantener** - workflows separados y claros
5. ✅ **Todos los binarios en un solo release** - experiencia perfecta para usuarios
