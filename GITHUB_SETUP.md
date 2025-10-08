# 🚀 Configuración de GitHub

Este archivo contiene las instrucciones para subir el proyecto a GitHub.

---

## 📋 Pasos para Subir a GitHub

### 1️⃣ Crear Repositorio en GitHub

1. Ve a [GitHub](https://github.com)
2. Inicia sesión con tu cuenta
3. Haz clic en el botón **"+"** (arriba a la derecha) → **"New repository"**
4. Configurar el repositorio:
   - **Repository name**: `indicaciones-app2` (o el nombre que prefieras)
   - **Description**: `Sistema de generación automática de indicaciones de laboratorio`
   - **Visibility**:
     - ✅ **Public** (si quieres que sea público)
     - ✅ **Private** (si quieres que sea privado)
   - **NO marcar** las opciones:
     - ❌ Add a README file
     - ❌ Add .gitignore
     - ❌ Choose a license

     *(Ya tenemos estos archivos creados localmente)*

5. Hacer clic en **"Create repository"**

---

### 2️⃣ Conectar el Repositorio Local con GitHub

GitHub te mostrará instrucciones. Usa estas:

```bash
# Ya tenemos el repositorio local inicializado, solo falta conectarlo

# 1. Agregar el repositorio remoto (reemplaza TU-USUARIO con tu nombre de usuario)
git remote add origin https://github.com/TU-USUARIO/indicaciones-app2.git

# 2. Renombrar la rama principal a 'main' (GitHub usa 'main' por defecto)
git branch -M main

# 3. Subir los archivos a GitHub
git push -u origin main
```

**Ejemplo con un usuario real:**

```bash
git remote add origin https://github.com/juan-perez/indicaciones-app2.git
git branch -M main
git push -u origin main
```

---

### 3️⃣ Autenticación

Si es la primera vez que usas Git con GitHub, te pedirá autenticarte:

#### Opción A: Personal Access Token (Recomendado)

1. Ve a: [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Clic en **"Generate new token (classic)"**
3. Darle un nombre: `indicaciones-app2-token`
4. Seleccionar scope: `repo` (todos los permisos de repositorio)
5. Clic en **"Generate token"**
6. **⚠️ COPIAR EL TOKEN** (no lo podrás ver de nuevo)
7. Cuando Git te pida la contraseña, pegar el token

#### Opción B: GitHub CLI (gh)

```bash
# Instalar GitHub CLI: https://cli.github.com/
gh auth login
```

---

### 4️⃣ Verificar que Subió Correctamente

1. Ve a tu repositorio en GitHub: `https://github.com/TU-USUARIO/indicaciones-app2`
2. Deberías ver:
   - ✅ README.md renderizado
   - ✅ Archivos del proyecto
   - ✅ 1 commit: "Initial commit - Etapa 2 completada"

---

## 📦 Comandos Git Útiles

### Ver Estado del Repositorio

```bash
git status
```

### Ver Historial de Commits

```bash
git log --oneline
```

### Crear un Nuevo Commit

```bash
# 1. Hacer cambios en los archivos
# 2. Agregar cambios al staging
git add .

# 3. Crear commit
git commit -m "Descripción del cambio"

# 4. Subir a GitHub
git push
```

### Ver Repositorios Remotos

```bash
git remote -v
```

### Deshacer Cambios (antes de commit)

```bash
# Descartar cambios en un archivo específico
git checkout -- nombre-archivo.js

# Descartar TODOS los cambios no commiteados
git reset --hard
```

### Crear una Rama Nueva

```bash
# Crear y cambiar a nueva rama
git checkout -b feature/nueva-funcionalidad

# Subir rama a GitHub
git push -u origin feature/nueva-funcionalidad
```

---

## 🔐 Proteger Información Sensible

### ⚠️ MUY IMPORTANTE

**NUNCA subas estos archivos a GitHub:**

- ✅ `.env` (credenciales) - **YA está en .gitignore**
- ✅ `node_modules/` (dependencias) - **YA está en .gitignore**
- ✅ `*.db` (base de datos) - **YA está en .gitignore**
- ✅ Archivos con passwords, API keys, tokens

### Si Subiste Algo por Error

```bash
# Eliminar archivo del historial de Git (¡CUIDADO!)
git rm --cached archivo-sensible.env
git commit -m "Remove sensitive file"
git push

# Cambiar INMEDIATAMENTE las credenciales comprometidas
```

---

## 📄 Agregar Licencia (Opcional)

Si quieres agregar una licencia MIT:

1. Crear archivo `LICENSE` en la raíz:

```
MIT License

Copyright (c) 2025 Tu Nombre

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

2. Commit y push:

```bash
git add LICENSE
git commit -m "Add MIT license"
git push
```

---

## 🏷️ Badges para el README (Opcional)

Puedes agregar estos badges al README.md:

```markdown
![GitHub last commit](https://img.shields.io/github/last-commit/TU-USUARIO/indicaciones-app2)
![GitHub repo size](https://img.shields.io/github/repo-size/TU-USUARIO/indicaciones-app2)
![GitHub stars](https://img.shields.io/github/stars/TU-USUARIO/indicaciones-app2?style=social)
```

---

## 🤝 Colaboradores (Opcional)

Para agregar colaboradores:

1. Ve a tu repositorio en GitHub
2. **Settings** → **Collaborators**
3. Clic en **"Add people"**
4. Ingresar el nombre de usuario de GitHub
5. Enviar invitación

---

## 📊 GitHub Actions (Opcional - Futuro)

Para automatizar tests, deploy, etc.:

Crear archivo `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm install
    - run: npm test
```

---

## 🎯 Resumen de Comandos

```bash
# Configuración inicial (una sola vez)
git remote add origin https://github.com/TU-USUARIO/indicaciones-app2.git
git branch -M main
git push -u origin main

# Flujo de trabajo diario
git status                    # Ver cambios
git add .                     # Agregar cambios
git commit -m "Mensaje"       # Crear commit
git push                      # Subir a GitHub

# Ver historial
git log --oneline --graph

# Descargar cambios de GitHub
git pull
```

---

## 🆘 Problemas Comunes

### Error: "remote origin already exists"

```bash
# Ver el remote actual
git remote -v

# Cambiar la URL
git remote set-url origin https://github.com/TU-USUARIO/indicaciones-app2.git
```

### Error: "fatal: not a git repository"

```bash
# Estás en la carpeta incorrecta, navega a la carpeta del proyecto
cd /ruta/a/tu/proyecto/indicaciones-app2

# Verificar que existe .git/
ls -la
```

### Error: "Authentication failed"

- Usa un Personal Access Token en vez de tu contraseña
- O instala GitHub CLI: `gh auth login`

---

## ✅ Checklist Final

Antes de considerar el proyecto listo en GitHub:

- [ ] README.md está completo y renderiza bien
- [ ] .gitignore incluye todos los archivos sensibles
- [ ] CHANGELOG.md está actualizado
- [ ] El repositorio tiene descripción
- [ ] (Opcional) Tiene licencia
- [ ] (Opcional) Tiene badges
- [ ] No hay archivos sensibles (.env, passwords, etc.)
- [ ] Las dependencias se instalan correctamente (`npm install`)
- [ ] El proyecto corre sin errores (`npm start`)

---

**¡Listo! Tu proyecto está en GitHub** 🎉

URL del repositorio: `https://github.com/TU-USUARIO/indicaciones-app2`

---

**Fecha de creación**: 07/10/2025
**Generado por**: Claude Code
