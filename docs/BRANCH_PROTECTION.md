# Configuración de Protección de Ramas en GitHub

Este archivo documenta la configuración recomendada para las ramas protegidas en GitHub.

## 🛡️ Protección de Rama: `main`

**Ruta en GitHub:** Settings → Branches → Branch protection rules → Add rule

### Configuración:

**Branch name pattern:** `main`

#### Protect matching branches:
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: **1**
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners (opcional)
  
- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - **Status checks encontrados:**
    - `build (windows-latest)`
    - `build (ubuntu-latest)`
    - `lint`
    - `type-check`
  
- ✅ **Require conversation resolution before merging**

- ✅ **Require signed commits** (opcional, pero recomendado)

- ✅ **Require linear history** (opcional)

- ✅ **Do not allow bypassing the above settings**

#### Rules applied to everyone including administrators:
- ✅ **Restrict who can push to matching branches**
  - Solo permitir pushes desde: `release/*` y `hotfix/*` branches
  
- ✅ **Block force pushes**

- ✅ **Block deletions**

---

## 🛡️ Protección de Rama: `develop`

**Branch name pattern:** `develop`

#### Protect matching branches:
- ✅ **Require a pull request before merging**
  - Require approvals: **1** (puede ser 0 para equipos pequeños)
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  
- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - **Status checks encontrados:**
    - `build-dev (windows-latest)`
    - `build-dev (ubuntu-latest)`
    - `lint`
    - `type-check`
  
- ✅ **Require conversation resolution before merging**

#### Rules applied to everyone including administrators:
- ✅ **Block force pushes**

- ⚠️ **Block deletions** (recomendado)

---

## 🔧 Configuración de CI/CD

### GitHub Actions Settings

**Ruta:** Settings → Actions → General

#### Workflow permissions:
- ✅ **Read and write permissions**
- ✅ **Allow GitHub Actions to create and approve pull requests**

#### Fork pull request workflows:
- ⚠️ **Require approval for all outside collaborators**

---

## 🔐 Secrets y Variables

**Ruta:** Settings → Secrets and variables → Actions

### Secrets requeridos:
- `GITHUB_TOKEN` (generado automáticamente)

### Variables opcionales:
- `NODE_VERSION`: `22` (o la versión que uses)

---

## 📋 Rulesets (Alternativa Moderna)

GitHub ahora ofrece "Rulesets" como alternativa a Branch Protection Rules.

**Ruta:** Settings → Rules → Rulesets → New ruleset

### Ruleset para `main` y `develop`:

**Ruleset name:** `Production Branches`

**Target branches:**
- `main`
- `develop`

**Rules:**
- ✅ Restrict creations
- ✅ Restrict updates
- ✅ Restrict deletions
- ✅ Require a pull request before merging
  - Required approvals: 1
- ✅ Require status checks to pass
- ✅ Block force pushes

**Bypass list:**
- Ninguno (aplicar a todos incluyendo admins)

---

## 🚀 Aplicar Configuración

### Opción 1: Interfaz Web
Sigue las instrucciones arriba directamente en GitHub.

### Opción 2: GitHub CLI
```bash
# Proteger rama main
gh api repos/CeroCloud/CeroCloud-Desktop/branches/main/protection \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  -f required_status_checks='{"strict":true,"contexts":["build (windows-latest)","build (ubuntu-latest)"]}' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"dismissal_restrictions":{},"dismiss_stale_reviews":true,"require_code_owner_reviews":false,"required_approving_review_count":1}' \
  -f restrictions=null
```

### Opción 3: Terraform (IaC)
```hcl
resource "github_branch_protection" "main" {
  repository_id = "CeroCloud-Desktop"
  pattern       = "main"
  
  required_status_checks {
    strict = true
    contexts = [
      "build (windows-latest)",
      "build (ubuntu-latest)",
    ]
  }
  
  required_pull_request_reviews {
    dismiss_stale_reviews           = true
    require_code_owner_reviews      = false
    required_approving_review_count = 1
  }
  
  enforce_admins = true
  
  restrict_pushes {
    blocks_creations = false
  }
}
```

---

## ✅ Checklist de Configuración

Antes de comenzar el desarrollo en equipo:

- [ ] Rama `main` protegida con las reglas anteriores
- [ ] Rama `develop` protegida con las reglas anteriores
- [ ] CI/CD workflows activos y funcionando
- [ ] Permisos de GitHub Actions configurados
- [ ] CODEOWNERS archivo creado (opcional)
- [ ] Branch ruleset aplicado (si usas rulesets)
- [ ] Documentación de Gitflow compartida con el equipo
- [ ] Scripts helper disponibles en `.github/`

---

## 📚 Referencias

- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [GitHub Actions Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)

---

*Última actualización: 8 de Enero de 2026*
