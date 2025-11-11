# .gitignore Guide

## Overview

The `.gitignore` file has been updated to comprehensively ignore all files that should not be committed to version control.

---

## 📋 What's Ignored

### 1. **Dependencies** 🔒

```
/node_modules
/.pnp
.yarn/*
package-lock.json
yarn.lock
pnpm-lock.yaml
```

**Why:** These are generated files and can be recreated with `npm install`

### 2. **Build Outputs** 🔒

```
/.next/
/out/
/build
/dist
```

**Why:** Generated during build process, should not be in version control

### 3. **Environment Variables** 🔒

```
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

**Why:** Contains sensitive information (API keys, secrets)

**Exception:** `.env.example` and `.env.local.example` are NOT ignored (templates)

### 4. **Logs** 🔒

```
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

**Why:** Generated during development, not needed in repo

### 5. **Operating System Files** 🔒

**macOS:**

```
.DS_Store
.AppleDouble
.LSOverride
```

**Windows:**

```
Thumbs.db
Desktop.ini
$RECYCLE.BIN/
```

**Linux:**

```
*~
.directory
.Trash-*
```

**Why:** OS-specific files, not part of the project

### 6. **IDE/Editor Files** 🔒

**VSCode:**

```
.vscode/*
!.vscode/settings.json  # Keep shared settings
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
```

**JetBrains (WebStorm, IntelliJ):**

```
.idea/
*.iml
```

**Sublime Text:**

```
*.sublime-project
*.sublime-workspace
```

**Vim:**

```
*.swp
*.swo
Session.vim
```

**Why:** Personal editor configurations, not needed by other developers

### 7. **TypeScript Build Files** 🔒

```
*.tsbuildinfo
.eslintcache
.stylelintcache
```

**Why:** Generated during compilation

### 8. **Certificates and Keys** 🔒

```
*.pem
*.key
*.cert
*.crt
*.p12
*.pfx
```

**Why:** Security sensitive, should never be committed

### 9. **Temporary Files** 🔒

```
*.tmp
*.temp
*.swp
*.bak
*.cache
```

**Why:** Temporary files created during development

### 10. **Database Files** 🔒

```
*.sqlite
*.sqlite3
*.db
```

**Why:** Local development databases

---

## ✅ What's NOT Ignored (Kept in Repo)

### Configuration Files

- `.env.example` - Template for environment variables
- `.env.local.example` - Template for local environment
- `.prettierrc` - Code formatting rules
- `.eslintrc.json` - Linting rules
- `.npmrc` - NPM configuration
- `.nvmrc` - Node version specification
- `.gitkeep` - Keep empty directories

### VSCode Shared Settings

- `.vscode/settings.json` - Shared editor settings
- `.vscode/tasks.json` - Shared tasks
- `.vscode/launch.json` - Shared debug configurations
- `.vscode/extensions.json` - Recommended extensions

---

## 🔍 Checking What's Ignored

### See all ignored files:

```bash
git status --ignored
```

### Check if a specific file is ignored:

```bash
git check-ignore -v filename
```

### See what would be committed:

```bash
git status
```

---

## 🧹 Cleaning Up Already Committed Files

If files that should be ignored are already in the repo:

### Remove a single file:

```bash
# Remove from git but keep locally
git rm --cached filename

# Commit the removal
git commit -m "Remove ignored file"
```

### Remove a directory:

```bash
# Remove from git but keep locally
git rm -r --cached directory/

# Commit the removal
git commit -m "Remove ignored directory"
```

### Remove all ignored files:

```bash
# Remove everything from git index
git rm -r --cached .

# Re-add everything (respecting .gitignore)
git add .

# Commit the changes
git commit -m "Clean up ignored files"
```

---

## 🚨 Important Files to NEVER Commit

### 1. Environment Variables

```
.env
.env.local
.env.production
```

**Contains:** API keys, database passwords, secrets

### 2. node_modules

```
/node_modules
```

**Size:** Can be 100MB - 1GB+
**Reason:** Can be recreated with `npm install`

### 3. Build Outputs

```
/.next/
/build
/dist
```

**Size:** Can be 50MB - 500MB+
**Reason:** Generated during build

### 4. Certificates/Keys

```
*.pem
*.key
*.cert
```

**Contains:** Private keys, SSL certificates

### 5. Database Files

```
*.sqlite
*.db
```

**Contains:** Local development data

---

## 📝 Best Practices

### 1. Use .env.example

```bash
# Create template
cp .env.local .env.local.example

# Remove sensitive values
# Replace with placeholders
NEXT_PUBLIC_API_URL=http://localhost:9600/api/v1
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
API_KEY=your_api_key_here
```

### 2. Document Required Environment Variables

Create a `README.md` section:

```markdown
## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `DATABASE_URL` - PostgreSQL connection string
- `API_KEY` - Your API key
```

### 3. Check Before Committing

```bash
# See what will be committed
git status

# Review changes
git diff

# Add files
git add .

# Commit
git commit -m "Your message"
```

### 4. Use .gitkeep for Empty Directories

```bash
# Git doesn't track empty directories
# Add .gitkeep to keep them
touch empty-directory/.gitkeep
git add empty-directory/.gitkeep
```

---

## 🔧 Troubleshooting

### Problem: File still being tracked despite .gitignore

**Cause:** File was committed before being added to .gitignore

**Solution:**

```bash
# Remove from git (keep locally)
git rm --cached filename

# Commit
git commit -m "Stop tracking filename"
```

### Problem: .gitignore not working

**Cause:** Git cache needs to be cleared

**Solution:**

```bash
# Clear git cache
git rm -r --cached .
git add .
git commit -m "Fix .gitignore"
```

### Problem: Accidentally committed .env file

**Solution:**

```bash
# Remove from git
git rm --cached .env

# Add to .gitignore (if not already)
echo ".env" >> .gitignore

# Commit
git commit -m "Remove .env file"

# IMPORTANT: Rotate all secrets in the .env file
# They are now in git history!
```

### Problem: Large files in repo

**Check repo size:**

```bash
git count-objects -vH
```

**Find large files:**

```bash
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  sed -n 's/^blob //p' | \
  sort --numeric-sort --key=2 | \
  tail -n 10
```

---

## 📊 Typical Ignored File Sizes

| Category       | Typical Size | Why Ignore     |
| -------------- | ------------ | -------------- |
| node_modules   | 100MB - 1GB  | Recreatable    |
| .next          | 50MB - 500MB | Build output   |
| .env           | < 1KB        | Sensitive data |
| .DS_Store      | 6KB - 12KB   | OS metadata    |
| \*.log         | 1KB - 100MB  | Debug info     |
| \*.tsbuildinfo | 10KB - 1MB   | Build cache    |

---

## ✅ Verification Checklist

After updating .gitignore:

- [ ] Run `git status` - no ignored files should appear
- [ ] Check `.env.local` is ignored
- [ ] Check `node_modules` is ignored
- [ ] Check `.next` is ignored
- [ ] Check `.DS_Store` is ignored (macOS)
- [ ] Check `Thumbs.db` is ignored (Windows)
- [ ] Verify `.env.example` is NOT ignored
- [ ] Verify configuration files are NOT ignored

---

## 🎯 Summary

**Updated:** `.gitignore` file
**Added:** Comprehensive ignore patterns
**Protected:** Sensitive files, build outputs, dependencies
**Kept:** Configuration templates, shared settings

**Result:** Clean repository with only source code and configuration templates

---

**Last Updated:** January 11, 2025
**Status:** ✅ Complete and Comprehensive
