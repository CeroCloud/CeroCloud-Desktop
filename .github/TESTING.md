# 🔧 Scripts de Diagnóstico y Prueba de Release

Este directorio contiene scripts de PowerShell para diagnosticar y probar el sistema de releases automáticos.

## 📋 Scripts Disponibles

### 1. `diagnose.ps1` - Diagnóstico Completo
**Propósito:** Verifica toda la configuración del proyecto y detecta problemas comunes.

```powershell
.\diagnose.ps1
```

**Qué verifica:**
- ✅ Configuración de Git
- ✅ Versión de Node.js y npm
- ✅ Configuración de package.json
- ✅ Plugins de semantic-release instalados
- ✅ Archivo .releaserc.json
- ✅ Directorios de build
- ✅ Workflows de GitHub Actions
- ✅ Análisis de commits desde el último tag
- ✅ Problemas comunes

**Usa este script PRIMERO** para obtener una visión general.

---

### 2. `validate-commits.ps1` - Validación de Commits
**Propósito:** Verifica que tus commits sigan el formato Conventional Commits requerido por semantic-release.

```powershell
.\validate-commits.ps1
```

**Qué hace:**
- 📝 Analiza los últimos 10 commits
- ✅ Identifica commits válidos (feat, fix, docs, etc.)
- ❌ Identifica commits inválidos
- 💡 Muestra ejemplos de formato correcto

**Formato correcto de commits:**
```
feat: agregar nueva funcionalidad       # Genera versión MINOR
fix: corregir bug                       # Genera versión PATCH
fix(hotfix): corrección urgente         # PATCH con scope
chore: actualizar dependencias          # No genera versión
docs: actualizar documentación          # No genera versión

# Para cambios incompatibles (MAJOR version):
feat!: cambio que rompe compatibilidad
# O en el cuerpo del commit:
feat: nueva funcionalidad

BREAKING CHANGE: descripción del cambio incompatible
```

---

### 3. `test-release.ps1` - Prueba Local de Release
**Propósito:** Ejecuta semantic-release en modo DRY-RUN (sin publicar nada).

```powershell
.\test-release.ps1
```

**Qué hace:**
- 🧪 Simula el proceso de release
- 🔍 Analiza commits y determina la próxima versión
- 📝 Muestra qué archivos se crearían/modificarían
- ❌ NO publica nada (es seguro ejecutarlo)

**Usa este script** después de validar commits para ver si el release funcionaría.

---

## 🚀 Flujo de Trabajo Recomendado

### Para Hotfixes:

```powershell
# 1. Crea la rama hotfix desde main
git checkout main
git pull origin main
git checkout -b hotfix/v1.1.2

# 2. Haz tus correcciones
# ... edita archivos ...

# 3. Commit con formato correcto
git add .
git commit -m "fix: corregir error crítico en auto-update"

# 4. Valida el commit
.\validate-commits.ps1

# 5. Prueba el release localmente
.\test-release.ps1

# 6. Si todo está OK, merge a main
git checkout main
git merge hotfix/v1.1.2 --no-ff
git push origin main

# 7. GitHub Actions se encargará del resto
```

### Para Desarrollo Normal:

```powershell
# 1. Trabaja en develop
git checkout develop
git pull origin develop

# 2. Crea feature branch
git checkout -b feature/nueva-funcionalidad

# 3. Haz commits con formato correcto
git commit -m "feat: agregar exportación de reportes"

# 4. Valida antes de push
.\validate-commits.ps1

# 5. Merge a develop
git checkout develop
git merge feature/nueva-funcionalidad
git push origin develop

# 6. GitHub Actions creará beta release
```

---

## ❌ Problemas Comunes y Soluciones

### Error: "Process completed with exit code 1"

**Causas posibles:**

1. **No hay commits válidos para release**
   - Solución: Verifica con `.\validate-commits.ps1`
   - Asegúrate de usar `feat:` o `fix:` en los commits

2. **Plugins de npm faltantes**
   - Solución: `npm ci` para reinstalar dependencias

3. **Build falla en el proceso**
   - Solución: Prueba `npm run type-check && npx vite build`

4. **GITHUB_TOKEN sin permisos**
   - Solución: Verifica en GitHub Actions que el token tenga permisos de escritura

### Error: "No release published"

Esto NO es un error. Significa que:
- No hay commits de `feat:` o `fix:` desde el último release
- Todos los commits son `chore:`, `docs:`, etc. (no generan versión)

### Error: Build falla al crear binarios

```powershell
# Verifica que electron-builder funcione localmente:
npm run type-check
npx vite build
npx electron-builder --win
```

---

## 📊 Interpretando la Salida

### validate-commits.ps1
```
✨ [abc123] feat: nueva funcionalidad    # Generará versión MINOR
🐛 [def456] fix: corrección de bug       # Generará versión PATCH
🔧 [ghi789] chore: actualizar deps       # NO genera versión
❌ [jkl012] cambios varios               # INVÁLIDO - no generará release
```

### test-release.ps1
```
[semantic-release] › ℹ  Analysis of 5 commits complete: minor release
[semantic-release] › ℹ  The next release version is 1.2.0
```

---

## 🔗 Enlaces Útiles

- [Semantic Release Docs](https://semantic-release.gitbook.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions - semantic-release](https://github.com/semantic-release/semantic-release/blob/master/docs/recipes/ci-configurations/github-actions.md)

---

## 💡 Tips

- **Siempre ejecuta `.\diagnose.ps1` primero** cuando tengas problemas
- **Usa `.\validate-commits.ps1`** antes de cada push importante
- **Prueba con `.\test-release.ps1`** antes de merge a main/develop
- Los commits de merge no necesitan seguir Conventional Commits
- Usa `git commit --amend` para corregir el último commit si olvidaste el formato

---

## 🆘 ¿Necesitas Ayuda?

1. Ejecuta `.\diagnose.ps1` y comparte la salida
2. Ejecuta `.\validate-commits.ps1` para verificar commits
3. Revisa los logs de GitHub Actions para el error específico
