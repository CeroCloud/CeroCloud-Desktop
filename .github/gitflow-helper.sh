#!/bin/bash
# Gitflow Helper Script para CeroCloud (Linux/Mac)
# Este script ayuda a crear y gestionar ramas siguiendo Gitflow

set -e

ACTION=$1
NAME=$2

function start_feature() {
    local feature_name=$1
    
    if [ -z "$feature_name" ]; then
        echo "❌ Error: Debes especificar el nombre de la feature"
        echo "Ejemplo: ./gitflow-helper.sh feature mi-nueva-caracteristica"
        exit 1
    fi
    
    echo "🚀 Creando feature branch: feature/$feature_name"
    
    git checkout develop
    git pull origin develop
    git checkout -b "feature/$feature_name"
    
    echo "✅ Feature branch creado exitosamente!"
    echo "📝 Trabaja en tu feature y haz commits usando Conventional Commits:"
    echo "   git commit -m 'feat: descripción de la característica'"
    echo ""
    echo "🔄 Cuando termines, haz push y crea un PR a develop:"
    echo "   git push origin feature/$feature_name"
}

function start_release() {
    local version=$1
    
    if [ -z "$version" ]; then
        echo "❌ Error: Debes especificar la versión del release"
        echo "Ejemplo: ./gitflow-helper.sh release v1.1.0"
        exit 1
    fi
    
    # Remover 'v' si está presente
    version=${version#v}
    
    echo "📦 Creando release branch: release/v$version"
    
    git checkout develop
    git pull origin develop
    git checkout -b "release/v$version"
    
    echo "⬆️  Actualizando versión en package.json..."
    npm version $version --no-git-tag-version
    
    git add package.json package-lock.json
    git commit -m "chore: bump version to $version"
    
    echo "✅ Release branch creado exitosamente!"
    echo ""
    echo "📝 Próximos pasos:"
    echo "   1. Actualiza changelog.md con las novedades"
    echo "   2. Haz los ajustes finales necesarios"
    echo "   3. Ejecuta: ./gitflow-helper.sh finish v$version"
}

function start_hotfix() {
    local hotfix_name=$1
    
    if [ -z "$hotfix_name" ]; then
        echo "❌ Error: Debes especificar el nombre del hotfix"
        echo "Ejemplo: ./gitflow-helper.sh hotfix fix-critical-bug"
        exit 1
    fi
    
    echo "🚨 Creando hotfix branch: hotfix/$hotfix_name"
    
    git checkout main
    git pull origin main
    git checkout -b "hotfix/$hotfix_name"
    
    echo "✅ Hotfix branch creado exitosamente!"
    echo "🔧 Corrige el bug y haz commits:"
    echo "   git commit -m 'fix: descripción del bug corregido'"
    echo ""
    echo "📌 Recuerda incrementar la versión patch:"
    echo "   npm version patch --no-git-tag-version"
}

function finish_branch() {
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    
    if [[ ! $current_branch =~ ^(release|hotfix)/ ]]; then
        echo "❌ Error: Solo puedes finalizar branches release/* o hotfix/*"
        echo "Tu rama actual: $current_branch"
        exit 1
    fi
    
    echo "🏁 Finalizando branch: $current_branch"
    
    # Merge a main
    echo "📤 Merging a main..."
    git checkout main
    git pull origin main
    git merge --no-ff $current_branch
    git push origin main
    
    # Merge a develop
    echo "📤 Merging a develop..."
    git checkout develop
    git pull origin develop
    git merge --no-ff $current_branch
    git push origin develop
    
    # Eliminar branch local y remota
    echo "🗑️  Eliminando branch $current_branch..."
    git branch -d $current_branch
    git push origin --delete $current_branch
    
    echo "✅ Branch finalizado y mergeado exitosamente!"
    echo "🚀 El release se creará automáticamente en GitHub Actions"
}

# Ejecutar la acción correspondiente
case $ACTION in
    feature)
        start_feature $NAME
        ;;
    release)
        start_release $NAME
        ;;
    hotfix)
        start_hotfix $NAME
        ;;
    finish)
        finish_branch
        ;;
    *)
        echo "❌ Acción inválida: $ACTION"
        echo "Uso: ./gitflow-helper.sh {feature|release|hotfix|finish} [nombre]"
        exit 1
        ;;
esac
