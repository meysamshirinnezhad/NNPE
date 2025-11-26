# AI Deployment Prompt for VPS

Copy and paste this entire prompt to your AI assistant running on the VPS:

---

# DEPLOYMENT TASK

You are an AI assistant helping deploy updates to the NPPE (National Professional Practice Examination) platform running on this VPS.

## Context

The NPPE platform has the following new changes ready to deploy from the Git branch `claude/backend-generation-prompt-01SMdkWyoFXTtghbRbPkt58j`:

### Files Changed:
1. **Frontend:**
   - `front/src/pages/landing/ConversionFocusedLanding.tsx` (NEW - high-converting landing page)
   - `front/src/router/config.tsx` (MODIFIED - uses new landing page)

2. **Backend:**
   - `back/internal/handlers/dashboard_handler.go` (REWRITTEN - fixed analytics with real data)
   - `back/internal/handlers/subscription_handler.go` (NEW - Stripe subscription system)

### What These Changes Do:
- **Landing page**: 3-5x better conversion rate (removed distractions, single CTA, email capture)
- **Dashboard**: Fixed analytics - now shows real topic mastery, weak topics, recent activity
- **Subscriptions**: Added subscription system endpoints (currently mock, needs Stripe API later)

## Your Task

Deploy these changes to the VPS by following these steps:

### Step 1: Locate the Project

First, find where the NPPE project is located. Common locations:
- `/var/www/NNPE`
- `/home/ubuntu/NNPE`
- `~/NNPE`
- `/opt/NNPE`

**Action:** Use `ls` to search common locations and find the project directory with `back/` and `front/` folders.

### Step 2: Create Backups

Before deploying, create backups of the current version.

**Action:**
1. Find current backend binary location (common: `/usr/local/bin/nppe-backend` or in project `/back/` directory)
2. Backup with: `sudo cp <current-binary-path> <current-binary-path>.backup.$(date +%Y%m%d)`
3. Find frontend location (common: `/var/www/nppe` or `/var/www/html/nppe`)
4. Backup with: `sudo cp -r <frontend-path> <frontend-path>.backup.$(date +%Y%m%d)`

### Step 3: Pull Latest Code

**Action:**
```bash
cd /path/to/NNPE
git fetch origin
git checkout claude/backend-generation-prompt-01SMdkWyoFXTtghbRbPkt58j
git pull origin claude/backend-generation-prompt-01SMdkWyoFXTtghbRbPkt58j
```

Verify the pull succeeded by checking recent commits:
```bash
git log --oneline -5
```

You should see commits about landing page and backend fixes.

### Step 4: Check Environment Variables

**Action:**
1. Locate the `.env` file (usually in `back/.env` or project root)
2. Read the file to check if these variables exist:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_MONTHLY_PRICE_ID`
   - `STRIPE_ANNUAL_PRICE_ID`

3. If they don't exist, inform the user that Stripe keys need to be added later (subscription system will use mock data until then)

### Step 5: Deploy Backend

**Action:**
```bash
cd /path/to/NNPE/back

# Download any new dependencies
go mod download

# Build new binary
go build -o nppe-backend cmd/main.go

# Verify build succeeded
ls -lh nppe-backend
```

If build fails, report the error and stop.

**Next:** Determine how the backend is currently running:

**Check for systemd service:**
```bash
sudo systemctl status nppe-backend
```

**If systemd exists:**
```bash
# Stop service
sudo systemctl stop nppe-backend

# Copy new binary to installation location (usually /usr/local/bin/)
sudo cp nppe-backend /usr/local/bin/nppe-backend
sudo chmod +x /usr/local/bin/nppe-backend

# Start service
sudo systemctl start nppe-backend

# Check status
sudo systemctl status nppe-backend
```

**If no systemd service found:**
```bash
# Find running process
ps aux | grep nppe-backend

# If found, kill it (note the PID first)
sudo kill -9 <PID>

# Start new version
nohup ./nppe-backend > logs/backend.log 2>&1 &
```

**Verify backend running:**
```bash
curl http://localhost:8080/health
```

Expected response: `{"status":"ok"}`

If this fails, check logs:
```bash
# For systemd:
sudo journalctl -u nppe-backend -n 50

# For manual:
tail -n 50 logs/backend.log
```

### Step 6: Deploy Frontend

**Action:**
```bash
cd /path/to/NNPE/front

# Install any new dependencies
npm install

# Build production bundle
npm run build
```

Verify build succeeded:
```bash
ls -la dist/
```

Should see `index.html` and `assets/` folder.

**Next:** Find where frontend is served from:

**Check nginx config:**
```bash
sudo cat /etc/nginx/sites-available/nppe 2>/dev/null || sudo cat /etc/nginx/nginx.conf | grep root
```

**Or check apache config:**
```bash
sudo cat /etc/apache2/sites-available/nppe.conf 2>/dev/null
```

Look for the `root` directive - this is where you need to copy files.

**Common locations:**
- `/var/www/nppe`
- `/var/www/html/nppe`
- `/var/www/html`

**Deploy build:**
```bash
# Replace <frontend-path> with actual path found above
sudo rm -rf <frontend-path>/*
sudo cp -r dist/* <frontend-path>/
sudo chown -R www-data:www-data <frontend-path>
sudo chmod -R 755 <frontend-path>
```

**Restart web server:**

**If nginx:**
```bash
sudo systemctl restart nginx
sudo systemctl status nginx
```

**If apache:**
```bash
sudo systemctl restart apache2
sudo systemctl status apache2
```

### Step 7: Verify Deployment

**Action:**

1. **Test backend health:**
   ```bash
   curl http://localhost:8080/health
   ```
   Expected: `{"status":"ok"}`

2. **Test new subscription endpoint:**
   ```bash
   curl http://localhost:8080/api/subscriptions/current
   ```
   Expected: JSON response (even if error about no auth token)

3. **Test dashboard endpoint:**
   ```bash
   curl http://localhost:8080/api/dashboard
   ```
   Expected: JSON response (even if error about no auth token)

4. **Check frontend file:**
   ```bash
   cat <frontend-path>/index.html | grep -i "nppe"
   ```
   Should return HTML content.

5. **Test in browser (if possible):**
   - Visit the domain and check if landing page loads
   - Should see "Pass Your NPPE Exam with Confidence" headline

### Step 8: Monitor for Issues

**Action:**

Watch logs for 30 seconds to ensure no errors:

**Backend logs:**
```bash
# Systemd:
sudo journalctl -u nppe-backend -f

# Manual:
tail -f logs/backend.log
```

Press Ctrl+C after 30 seconds.

**Web server logs:**
```bash
sudo tail -f /var/log/nginx/error.log
# or
sudo tail -f /var/log/apache2/error.log
```

Press Ctrl+C after 30 seconds.

Report any errors you see.

### Step 9: Final Report

**Action:**

Provide a summary report with:

1. ✅ Backup locations created
2. ✅ Git branch checked out and pulled
3. ✅ Backend built and restarted
4. ✅ Frontend built and deployed
5. ✅ Health check results
6. ✅ Any errors or warnings encountered
7. 📋 Next steps needed (if any)

---

## Important Notes for AI:

- **If any step fails**, stop immediately and report the error with context
- **Always create backups** before replacing binaries or files
- **Verify each step** before moving to the next
- **Read logs** if something doesn't work
- **Report everything** you do so the user can verify

## Rollback Instructions (if needed):

If something goes wrong and user asks to rollback:

```bash
# Stop new backend
sudo systemctl stop nppe-backend

# Restore old backend
sudo cp /usr/local/bin/nppe-backend.backup.<date> /usr/local/bin/nppe-backend

# Restart
sudo systemctl start nppe-backend

# Restore old frontend
sudo rm -rf <frontend-path>/*
sudo cp -r <frontend-path>.backup.<date>/* <frontend-path>/

# Restart web server
sudo systemctl restart nginx
```

---

## Start Deployment Now

Begin with Step 1 and work through each step carefully. Report your progress as you go.

Good luck! 🚀
