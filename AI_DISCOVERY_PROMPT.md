# AI Discovery Prompt - Find All VPS Configuration Details

Copy and paste this to your AI on the VPS to discover all necessary deployment information:

---

# DISCOVERY TASK: Identify NPPE Platform Configuration

You need to discover all configuration details for the NPPE platform currently running on this VPS. This information will be used for deployment.

## Your Task: Find and Report ALL of the Following

### 1. PROJECT LOCATION

**Find the NPPE project directory:**

```bash
# Check common locations
find /var/www -name "NNPE" -type d 2>/dev/null
find /home -name "NNPE" -type d 2>/dev/null
find /opt -name "NNPE" -type d 2>/dev/null
find ~ -name "NNPE" -type d 2>/dev/null
```

**Verify it's the right directory:**
```bash
# Should contain back/ and front/ directories
ls -la /path/found/above/
```

**Report:**
- ✅ Full path to NNPE project directory
- ✅ Contents of directory (list back/, front/, etc.)

---

### 2. BACKEND CONFIGURATION

**A. Find backend binary location:**

```bash
# Check if running via systemd
sudo systemctl status nppe-backend 2>/dev/null

# If systemd exists, find binary path:
sudo systemctl cat nppe-backend | grep ExecStart

# Also check common locations:
which nppe-backend
ls -la /usr/local/bin/nppe-backend 2>/dev/null
ls -la /usr/bin/nppe-backend 2>/dev/null
```

**B. Find running backend process:**

```bash
ps aux | grep nppe-backend | grep -v grep
ps aux | grep "go run" | grep -v grep
```

**C. Find backend port:**

```bash
sudo netstat -tlnp | grep nppe
# or
sudo ss -tlnp | grep nppe
```

**D. Find backend logs location:**

```bash
# If systemd:
sudo journalctl -u nppe-backend -n 5

# If manual, check common log locations:
ls -la /var/log/nppe* 2>/dev/null
find /var/log -name "*nppe*" 2>/dev/null
```

**E. Find environment file:**

```bash
# Check project directory
ls -la /path/to/NNPE/.env 2>/dev/null
ls -la /path/to/NNPE/back/.env 2>/dev/null

# Check systemd service for environment file
sudo systemctl cat nppe-backend | grep Environment
```

**Report:**
- ✅ Backend binary location (e.g., `/usr/local/bin/nppe-backend`)
- ✅ How it's running (systemd service name OR manual process)
- ✅ Process ID (PID) if running
- ✅ Port number (default: 8080)
- ✅ Log location
- ✅ Environment file location

---

### 3. FRONTEND CONFIGURATION

**A. Find web server type:**

```bash
# Check nginx
sudo systemctl status nginx 2>/dev/null
nginx -v 2>&1

# Check apache
sudo systemctl status apache2 2>/dev/null
apache2 -v 2>&1
```

**B. Find nginx configuration (if nginx):**

```bash
# Find NPPE site config
ls -la /etc/nginx/sites-available/ | grep nppe
ls -la /etc/nginx/sites-enabled/ | grep nppe

# Read config to find root directory
sudo cat /etc/nginx/sites-available/nppe 2>/dev/null || sudo cat /etc/nginx/sites-available/default

# Look for "root" directive
sudo grep -r "root" /etc/nginx/sites-available/ | grep -i nppe
sudo grep -r "root" /etc/nginx/nginx.conf
```

**C. Find apache configuration (if apache):**

```bash
# Find NPPE site config
ls -la /etc/apache2/sites-available/ | grep nppe
ls -la /etc/apache2/sites-enabled/ | grep nppe

# Read config
sudo cat /etc/apache2/sites-available/nppe.conf 2>/dev/null || sudo cat /etc/apache2/sites-available/000-default.conf

# Look for DocumentRoot
sudo grep -r "DocumentRoot" /etc/apache2/sites-available/
```

**D. Verify frontend files location:**

```bash
# Common locations to check
ls -la /var/www/nppe/ 2>/dev/null
ls -la /var/www/html/nppe/ 2>/dev/null
ls -la /var/www/html/ 2>/dev/null

# Check for index.html
find /var/www -name "index.html" -path "*/nppe/*" 2>/dev/null
```

**E. Check current frontend version:**

```bash
# Look for indication of current landing page
cat /var/www/nppe/index.html | grep -i "landing\|nppe\|exam" | head -5
```

**Report:**
- ✅ Web server type (nginx or apache2)
- ✅ Web server config file location
- ✅ Frontend files location (document root)
- ✅ Current files present (index.html exists?)
- ✅ Web server process status

---

### 4. DATABASE CONFIGURATION

**A. Find database type and status:**

```bash
# PostgreSQL
sudo systemctl status postgresql 2>/dev/null
psql --version 2>&1

# Check if PostgreSQL is listening
sudo netstat -tlnp | grep 5432
```

**B. Find database connection details:**

```bash
# Read from environment file (found in step 2E)
cat /path/to/.env | grep -i "db\|database\|postgres"

# Check backend config if exists
cat /path/to/NNPE/back/config.yaml 2>/dev/null
cat /path/to/NNPE/back/config.json 2>/dev/null
```

**C. Test database connection:**

```bash
# Try to list databases (may need credentials)
sudo -u postgres psql -l

# Or check specific NPPE database
sudo -u postgres psql -d nppe_db -c "\dt" 2>/dev/null
```

**Report:**
- ✅ Database type and version
- ✅ Database running status
- ✅ Database name (likely `nppe_db` or similar)
- ✅ Connection details from .env

---

### 5. GIT CONFIGURATION

**A. Check current git status:**

```bash
cd /path/to/NNPE
git status
git branch
git log --oneline -5
```

**B. Check remote:**

```bash
git remote -v
```

**Report:**
- ✅ Current branch
- ✅ Git status (clean, uncommitted changes, etc.)
- ✅ Recent commits
- ✅ Remote repository URL

---

### 6. SYSTEM INFORMATION

**A. System details:**

```bash
# OS version
cat /etc/os-release | grep PRETTY_NAME
uname -a

# Disk space
df -h | grep -E "Filesystem|/$|/var"

# Memory
free -h

# CPU
nproc
```

**B. Installed software versions:**

```bash
# Go
go version

# Node.js
node --version
npm --version

# Git
git --version
```

**Report:**
- ✅ Operating system
- ✅ Available disk space
- ✅ Go version
- ✅ Node.js version
- ✅ npm version

---

### 7. DOMAIN/URL CONFIGURATION

**A. Find domain name:**

```bash
# From nginx config
sudo grep -r "server_name" /etc/nginx/sites-available/ | grep nppe

# From apache config
sudo grep -r "ServerName" /etc/apache2/sites-available/ | grep nppe

# Check hosts file
cat /etc/hosts | grep nppe
```

**B. Check SSL/HTTPS:**

```bash
# Check for SSL certificates
ls -la /etc/letsencrypt/live/*/fullchain.pem 2>/dev/null
sudo grep -r "ssl_certificate" /etc/nginx/
sudo grep -r "SSLCertificate" /etc/apache2/
```

**Report:**
- ✅ Domain name(s) configured
- ✅ SSL status (enabled/disabled)
- ✅ Certificate location (if SSL enabled)

---

### 8. RUNNING SERVICES

**Check all NPPE-related services:**

```bash
# List all systemd services
sudo systemctl list-units | grep -i nppe

# Check processes
ps aux | grep -E "nppe|go.*main|node.*vite" | grep -v grep

# Check ports in use
sudo netstat -tlnp | grep -E ":80|:443|:8080|:3000"
```

**Report:**
- ✅ All running NPPE-related processes
- ✅ Ports in use
- ✅ Service names

---

## FINAL REPORT FORMAT

Please provide a summary in this exact format:

```
=== NPPE VPS CONFIGURATION DISCOVERY ===

1. PROJECT LOCATION:
   - Path: /path/to/NNPE
   - Contents: [list back/, front/, etc.]

2. BACKEND:
   - Binary Location: /usr/local/bin/nppe-backend
   - Running Via: systemd service "nppe-backend" [or: manual process PID 12345]
   - Port: 8080
   - Log Location: /var/log/nppe or journalctl
   - Environment File: /path/to/.env
   - Current Status: [running/stopped]

3. FRONTEND:
   - Web Server: nginx [or apache2]
   - Config File: /etc/nginx/sites-available/nppe
   - Document Root: /var/www/nppe
   - Current Files: [index.html present? yes/no]
   - Current Status: [running/stopped]

4. DATABASE:
   - Type: PostgreSQL 15
   - Status: running
   - Database Name: nppe_db
   - Connection: [from .env file]

5. GIT:
   - Current Branch: main [or other]
   - Status: clean [or: uncommitted changes]
   - Remote: https://github.com/user/NNPE

6. SYSTEM:
   - OS: Ubuntu 22.04
   - Go: 1.23.1
   - Node: 20.10.0
   - npm: 10.2.3
   - Disk Space: 45GB available

7. DOMAIN:
   - Domain: nppe-platform.com [or: localhost, IP address]
   - SSL: enabled [or: disabled]
   - Certificate: /etc/letsencrypt/live/nppe-platform.com/

8. RUNNING SERVICES:
   - nppe-backend (PID: 12345, Port: 8080)
   - nginx (PID: 678, Ports: 80, 443)
   - postgresql (PID: 910, Port: 5432)

=== READY FOR DEPLOYMENT ===
```

---

## IMPORTANT

- If you can't find something, say "NOT FOUND" and suggest where to look
- If a command fails due to permissions, try with `sudo`
- If multiple options exist (e.g., multiple config files), list all of them
- Copy actual file contents when relevant (especially configs)

## START DISCOVERY NOW

Execute all commands above and provide the final report.
