# Script de diagnóstico completo

Write-Host "🔧 Diagnóstico del Sistema de Release" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# 1. Verificar Git
Write-Host "1️⃣  Git Configuration" -ForegroundColor Yellow
Write-Host "   Repository: " -NoNewline
git remote get-url origin
Write-Host "   User: " -NoNewline
git config user.name
Write-Host "   Email: " -NoNewline
git config user.email
Write-Host "   Branch: " -NoNewline
git rev-parse --abbrev-ref HEAD

# 2. Verificar Node y npm
Write-Host "`n2️⃣  Node.js Environment" -ForegroundColor Yellow
Write-Host "   Node: " -NoNewline
node --version
Write-Host "   npm: " -NoNewline
npm --version

# 3. Verificar package.json
Write-Host "`n3️⃣  Package Configuration" -ForegroundColor Yellow
$pkg = Get-Content "package.json" -Raw | ConvertFrom-Json
Write-Host "   Name: $($pkg.name)" -ForegroundColor White
Write-Host "   Version: $($pkg.version)" -ForegroundColor White
Write-Host "   Private: $($pkg.private)" -ForegroundColor White

# 4. Verificar semantic-release dependencies
Write-Host "`n4️⃣  Semantic Release Plugins" -ForegroundColor Yellow
$plugins = @(
    "semantic-release",
    "@semantic-release/changelog",
    "@semantic-release/commit-analyzer",
    "@semantic-release/exec",
    "@semantic-release/git",
    "@semantic-release/github",
    "@semantic-release/npm",
    "@semantic-release/release-notes-generator"
)

foreach ($plugin in $plugins) {
    $installed = $pkg.devDependencies.$plugin
    if ($installed) {
        Write-Host "   ✅ $plugin ($installed)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $plugin (NO INSTALADO)" -ForegroundColor Red
    }
}

# 5. Verificar .releaserc.json
Write-Host "`n5️⃣  Release Configuration" -ForegroundColor Yellow
if (Test-Path ".releaserc.json") {
    Write-Host "   ✅ .releaserc.json existe" -ForegroundColor Green
    $releaserc = Get-Content ".releaserc.json" -Raw | ConvertFrom-Json
    Write-Host "   Branches configuradas:" -ForegroundColor White
    foreach ($branch in $releaserc.branches) {
        if ($branch -is [string]) {
            Write-Host "      - $branch" -ForegroundColor White
        } else {
            Write-Host "      - $($branch.name) (prerelease: $($branch.prerelease))" -ForegroundColor White
        }
    }
} else {
    Write-Host "   ❌ .releaserc.json NO encontrado" -ForegroundColor Red
}

# 6. Verificar archivos de build
Write-Host "`n6️⃣  Build Artifacts" -ForegroundColor Yellow
$buildDirs = @("dist", "dist-electron", "release")
foreach ($dir in $buildDirs) {
    if (Test-Path $dir) {
        $files = (Get-ChildItem $dir -Recurse -File).Count
        Write-Host "   ✅ $dir/ ($files archivos)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $dir/ (no existe)" -ForegroundColor Yellow
    }
}

# 7. Verificar GitHub Actions
Write-Host "`n7️⃣  GitHub Actions Workflows" -ForegroundColor Yellow
if (Test-Path ".github/workflows") {
    $workflows = Get-ChildItem ".github/workflows/*.yml"
    foreach ($wf in $workflows) {
        Write-Host "   ✅ $($wf.Name)" -ForegroundColor Green
    }
} else {
    Write-Host "   ❌ .github/workflows/ NO encontrado" -ForegroundColor Red
}

# 8. Simular semantic-release dry-run
Write-Host "`n8️⃣  Semantic Release Test" -ForegroundColor Yellow
Write-Host "   Ejecutando análisis de commits..." -ForegroundColor White

# Verificar si hay commits que generarían release
$lastTag = git describe --tags --abbrev=0 2>$null
if ($lastTag) {
    Write-Host "   Último tag: $lastTag" -ForegroundColor White
    $commitsSinceTag = git log "$lastTag..HEAD" --oneline | Measure-Object -Line
    Write-Host "   Commits desde último tag: $($commitsSinceTag.Lines)" -ForegroundColor White
} else {
    Write-Host "   ⚠️  No hay tags en el repositorio" -ForegroundColor Yellow
}

# 9. Verificar problemas comunes
Write-Host "`n9️⃣  Problemas Comunes" -ForegroundColor Yellow
$issues = @()

# Verificar si package.json está en .gitignore
if (Select-String -Path ".gitignore" -Pattern "package.json" -Quiet) {
    $issues += "   ⚠️  package.json está en .gitignore (puede causar problemas)"
}

# Verificar si changelog.md existe
if (-not (Test-Path "changelog.md")) {
    $issues += "   ⚠️  changelog.md no existe (se creará automáticamente)"
}

# Verificar instalación de node_modules
if (-not (Test-Path "node_modules")) {
    $issues += "   ❌ node_modules no instalado - ejecuta: npm ci"
}

if ($issues.Count -eq 0) {
    Write-Host "   ✅ No se detectaron problemas" -ForegroundColor Green
} else {
    foreach ($issue in $issues) {
        Write-Host $issue -ForegroundColor Yellow
    }
}

# Resumen final
Write-Host "`n" + "="*50 -ForegroundColor Cyan
Write-Host "📋 RESUMEN" -ForegroundColor Cyan
Write-Host "="*50 -ForegroundColor Cyan

Write-Host "`n💡 Próximos pasos recomendados:" -ForegroundColor Yellow
Write-Host "   1. Ejecuta: .\validate-commits.ps1 (verificar formato de commits)" -ForegroundColor White
Write-Host "   2. Ejecuta: .\test-release.ps1 (probar release localmente)" -ForegroundColor White
Write-Host "   3. Si todo está OK, haz push a main o develop" -ForegroundColor White

Write-Host "`n📚 Documentación útil:" -ForegroundColor Yellow
Write-Host "   - Semantic Release: https://semantic-release.gitbook.io/" -ForegroundColor White
Write-Host "   - Conventional Commits: https://www.conventionalcommits.org/" -ForegroundColor White
