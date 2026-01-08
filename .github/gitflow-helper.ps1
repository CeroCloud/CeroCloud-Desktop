# Gitflow Helper Script para CeroCloud
# Este script ayuda a crear y gestionar ramas siguiendo Gitflow

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('feature', 'release', 'hotfix', 'finish')]
    [string]$Action,
    
    [Parameter(Mandatory=$false)]
    [string]$Name
)

function Start-Feature {
    param([string]$FeatureName)
    
    if ([string]::IsNullOrEmpty($FeatureName)) {
        Write-Host "❌ Error: Debes especificar el nombre de la feature" -ForegroundColor Red
        Write-Host "Ejemplo: .\gitflow-helper.ps1 feature mi-nueva-caracteristica" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "🚀 Creando feature branch: feature/$FeatureName" -ForegroundColor Cyan
    
    git checkout develop
    git pull origin develop
    git checkout -b "feature/$FeatureName"
    
    Write-Host "✅ Feature branch creado exitosamente!" -ForegroundColor Green
    Write-Host "📝 Trabaja en tu feature y haz commits usando Conventional Commits:" -ForegroundColor Yellow
    Write-Host "   git commit -m 'feat: descripción de la característica'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔄 Cuando termines, haz push y crea un PR a develop:" -ForegroundColor Yellow
    Write-Host "   git push origin feature/$FeatureName" -ForegroundColor Gray
}

function Start-Release {
    param([string]$Version)
    
    if ([string]::IsNullOrEmpty($Version)) {
        Write-Host "❌ Error: Debes especificar la versión del release" -ForegroundColor Red
        Write-Host "Ejemplo: .\gitflow-helper.ps1 release v1.1.0" -ForegroundColor Yellow
        exit 1
    }
    
    # Remover 'v' si está presente
    $CleanVersion = $Version -replace '^v', ''
    
    Write-Host "📦 Creando release branch: release/v$CleanVersion" -ForegroundColor Cyan
    
    git checkout develop
    git pull origin develop
    git checkout -b "release/v$CleanVersion"
    
    Write-Host "⬆️  Actualizando versión en package.json..." -ForegroundColor Yellow
    npm version $CleanVersion --no-git-tag-version
    
    git add package.json package-lock.json
    git commit -m "chore: bump version to $CleanVersion"
    
    Write-Host "✅ Release branch creado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Próximos pasos:" -ForegroundColor Yellow
    Write-Host "   1. Actualiza changelog.md con las novedades" -ForegroundColor Gray
    Write-Host "   2. Haz los ajustes finales necesarios" -ForegroundColor Gray
    Write-Host "   3. Ejecuta: .\gitflow-helper.ps1 finish v$CleanVersion" -ForegroundColor Gray
}

function Start-Hotfix {
    param([string]$HotfixName)
    
    if ([string]::IsNullOrEmpty($HotfixName)) {
        Write-Host "❌ Error: Debes especificar el nombre del hotfix" -ForegroundColor Red
        Write-Host "Ejemplo: .\gitflow-helper.ps1 hotfix fix-critical-bug" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "🚨 Creando hotfix branch: hotfix/$HotfixName" -ForegroundColor Red
    
    git checkout main
    git pull origin main
    git checkout -b "hotfix/$HotfixName"
    
    Write-Host "✅ Hotfix branch creado exitosamente!" -ForegroundColor Green
    Write-Host "🔧 Corrige el bug y haz commits:" -ForegroundColor Yellow
    Write-Host "   git commit -m 'fix: descripción del bug corregido'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📌 Recuerda incrementar la versión patch:" -ForegroundColor Yellow
    Write-Host "   npm version patch --no-git-tag-version" -ForegroundColor Gray
}

function Finish-Branch {
    param([string]$BranchName)
    
    $CurrentBranch = git rev-parse --abbrev-ref HEAD
    
    if ($CurrentBranch -notmatch '^(release|hotfix)/') {
        Write-Host "❌ Error: Solo puedes finalizar branches release/* o hotfix/*" -ForegroundColor Red
        Write-Host "Tu rama actual: $CurrentBranch" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "🏁 Finalizando branch: $CurrentBranch" -ForegroundColor Cyan
    
    # Merge a main
    Write-Host "📤 Merging a main..." -ForegroundColor Yellow
    git checkout main
    git pull origin main
    git merge --no-ff $CurrentBranch
    git push origin main
    
    # Merge a develop
    Write-Host "📤 Merging a develop..." -ForegroundColor Yellow
    git checkout develop
    git pull origin develop
    git merge --no-ff $CurrentBranch
    git push origin develop
    
    # Eliminar branch local y remota
    Write-Host "🗑️  Eliminando branch $CurrentBranch..." -ForegroundColor Yellow
    git branch -d $CurrentBranch
    git push origin --delete $CurrentBranch
    
    Write-Host "✅ Branch finalizado y mergeado exitosamente!" -ForegroundColor Green
    Write-Host "🚀 El release se creará automáticamente en GitHub Actions" -ForegroundColor Cyan
}

# Ejecutar la acción correspondiente
switch ($Action) {
    'feature' { Start-Feature -FeatureName $Name }
    'release' { Start-Release -Version $Name }
    'hotfix'  { Start-Hotfix -HotfixName $Name }
    'finish'  { Finish-Branch -BranchName $Name }
}
