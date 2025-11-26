# PRECISE DEPLOYMENT PROMPT FOR YOUR VPS

Copy this exact prompt to your AI on nppe.mshtechlab.com:

---

# DEPLOYMENT TASK: Deploy NPPE Updates to nppe.mshtechlab.com

## EXACT CONFIGURATION (from discovery):

```bash
PROJECT_PATH="/root/Learning-platform/source"
BACKEND_PORT=8889
FRONTEND_OUT="/root/Learning-platform/source/front/out"
WEB_SERVER="nginx"
BRANCH="claude/backend-generation-prompt-01SMdkWyoFXTtghbRbPkt58j"
DOMAIN="nppe.mshtechlab.com"
```

## IMPORTANT NOTES:
- Backend runs via `go run cmd/api/main.go` (NOT a compiled binary)
- Backend process PIDs: 369843, 369881
- Frontend output directory is currently EMPTY - needs build
- Currently on `main` branch, needs to switch to feature branch
- No systemd service - manual process management required

---

## DEPLOYMENT STEPS

### STEP 1: Create Backups

```bash
cd /root/Learning-platform/source

# Backup current code (before switching branches)
tar -czf /root/backups/nppe-main-$(date +%Y%m%d-%H%M%S).tar.gz \
  back/ front/ --exclude=node_modules --exclude=dist

# Backup frontend out directory (if any files exist)
if [ "$(ls -A /root/Learning-platform/source/front/out)" ]; then
  sudo cp -r /root/Learning-platform/source/front/out /root/backups/frontend-out-$(date +%Y%m%d-%H%M%S)
fi

# List backups created
ls -lh /root/backups/
```

**Expected output:** Backup file created with timestamp

---

### STEP 2: Stop Backend Process

```bash
# Find and kill current backend process
ps aux | grep "go run cmd/api/main.go" | grep -v grep

# Kill the processes (replace PIDs if different)
sudo kill -15 369843 369881

# Verify stopped
sleep 2
ps aux | grep "go run cmd/api/main.go" | grep -v grep
# Should return nothing

# Verify port is free
sudo netstat -tlnp | grep 8889
# Should return nothing
```

**Expected output:** Processes terminated, port 8889 free

---

### STEP 3: Pull New Code from Feature Branch

```bash
cd /root/Learning-platform/source

# Fetch all branches
git fetch origin

# Checkout feature branch
git checkout claude/backend-generation-prompt-01SMdkWyoFXTtghbRbPkt58j

# Pull latest changes
git pull origin claude/backend-generation-prompt-01SMdkWyoFXTtghbRbPkt58j

# Verify on correct branch
git branch --show-current
git log --oneline -5
```

**Expected output:**
- Switched to branch 'claude/backend-generation-prompt-01SMdkWyoFXTtghbRbPkt58j'
- Recent commits about landing page and backend fixes

---

### STEP 4: Update Backend Dependencies

```bash
cd /root/Learning-platform/source/back

# Download any new Go modules
go mod download

# Verify no errors
echo "Go modules updated successfully"
```

**Expected output:** Modules downloaded (or already present)

---

### STEP 5: Rebuild and Restart Backend

**Important:** Your backend runs via `go run`, not a compiled binary.

```bash
cd /root/Learning-platform/source/back

# Start backend in background with nohup
nohup go run cmd/api/main.go > /root/logs/backend-$(date +%Y%m%d).log 2>&1 &

# Get new process ID
sleep 3
ps aux | grep "go run cmd/api/main.go" | grep -v grep

# Verify listening on port 8889
sudo netstat -tlnp | grep 8889
```

**Expected output:**
- New process running
- Port 8889 listening

**Verify health:**
```bash
curl http://localhost:8889/health
```

**Expected:** `{"status":"ok"}` or similar health response

**Check logs:**
```bash
tail -n 30 /root/logs/backend-$(date +%Y%m%d).log
```

Look for:
- ✅ "Server listening on :8889" or similar
- ✅ "Database connected"
- ❌ No errors about missing files or database issues

---

### STEP 6: Install Frontend Dependencies (if needed)

```bash
cd /root/Learning-platform/source/front

# Install any new packages
npm install
```

**Expected output:** Dependencies installed or already up to date

---

### STEP 7: Build Frontend for Production

**Important:** Your frontend outputs to `/root/Learning-platform/source/front/out`

```bash
cd /root/Learning-platform/source/front

# Build production frontend
npm run build

# Verify build created
ls -la out/
```

**Expected output:**
- Build process completes successfully
- `out/` directory contains: index.html, _next/, assets/, etc.

**Verify new landing page:**
```bash
# Check if new landing page component is in build
grep -r "Pass Your NPPE Exam with Confidence" out/ || echo "Landing page text not found - may be in JS bundle"
```

---

### STEP 8: Restart Nginx

```bash
# Test nginx configuration first
sudo nginx -t

# Reload nginx to pick up any changes
sudo systemctl reload nginx

# Verify nginx running
sudo systemctl status nginx
```

**Expected output:**
- nginx configuration test successful
- nginx reloaded successfully

---

### STEP 9: Full Verification

**Test Backend:**
```bash
# Health check
curl http://localhost:8889/health

# Test new subscription endpoint
curl -X GET http://localhost:8889/api/subscriptions/current
# Expected: JSON response (may be error if no auth token - that's OK)

# Test dashboard endpoint
curl -X GET http://localhost:8889/api/dashboard
# Expected: JSON response (may be error if no auth token - that's OK)
```

**Test Frontend:**
```bash
# Check if nginx is serving files
curl -I https://nppe.mshtechlab.com

# Check if out directory has files
ls -la /root/Learning-platform/source/front/out/ | head -10
```

**Check Logs:**
```bash
# Backend logs (last 20 lines)
tail -n 20 /root/logs/backend-$(date +%Y%m%d).log

# Nginx error logs (last 20 lines)
sudo tail -n 20 /var/log/nginx/error.log
```

---

### STEP 10: Monitor for 30 Seconds

```bash
# Watch backend logs
tail -f /root/logs/backend-$(date +%Y%m%d).log &
TAIL_PID=$!

# Wait 30 seconds
sleep 30

# Stop watching
kill $TAIL_PID
```

Report any errors that appear during monitoring.

---

## FINAL VERIFICATION CHECKLIST

Run these final checks:

```bash
echo "=== DEPLOYMENT VERIFICATION ==="

echo "1. Backend Process:"
ps aux | grep "go run cmd/api/main.go" | grep -v grep

echo -e "\n2. Backend Port:"
sudo netstat -tlnp | grep 8889

echo -e "\n3. Backend Health:"
curl http://localhost:8889/health

echo -e "\n4. Frontend Files:"
ls -lh /root/Learning-platform/source/front/out/ | head -5

echo -e "\n5. Nginx Status:"
sudo systemctl status nginx --no-pager | head -5

echo -e "\n6. Git Branch:"
cd /root/Learning-platform/source && git branch --show-current

echo -e "\n7. Recent Backend Logs:"
tail -n 5 /root/logs/backend-$(date +%Y%m%d).log

echo "=== END VERIFICATION ==="
```

---

## EXPECTED RESULTS

After successful deployment:

✅ **Backend:**
- Process running (new PID)
- Port 8889 listening
- Health check returns {"status":"ok"}
- No errors in logs

✅ **Frontend:**
- `/root/Learning-platform/source/front/out/` contains files
- index.html exists
- Nginx serving files

✅ **Git:**
- Branch: claude/backend-generation-prompt-01SMdkWyoFXTtghbRbPkt58j
- Clean status

✅ **Website:**
- https://nppe.mshtechlab.com loads
- New landing page visible
- Dashboard analytics working

---

## ROLLBACK PROCEDURE (if needed)

If anything goes wrong:

```bash
# Stop new backend
ps aux | grep "go run cmd/api/main.go" | grep -v grep
sudo kill -15 <NEW_PID>

# Switch back to main branch
cd /root/Learning-platform/source
git checkout main
git pull origin main

# Rebuild frontend
cd front
npm run build

# Restart backend
cd ../back
nohup go run cmd/api/main.go > /root/logs/backend-$(date +%Y%m%d).log 2>&1 &

# Reload nginx
sudo systemctl reload nginx
```

---

## NEXT STEPS AFTER DEPLOYMENT

1. **Test the website:**
   - Visit https://nppe.mshtechlab.com
   - Should see new landing page: "Pass Your NPPE Exam with Confidence"
   - Try signup flow
   - Check dashboard analytics

2. **Stripe Integration (CRITICAL for payments):**
   - Your Stripe keys are already in .env
   - But subscription_handler.go uses MOCK data (lines 67-110)
   - Need to replace with real Stripe API calls before accepting payments
   - See: /root/Learning-platform/source/FIRST_10_SALES_CHECKLIST.md

3. **Launch Marketing:**
   - Follow /root/Learning-platform/source/LINKEDIN_LAUNCH_POST.md
   - Start outreach (20-30 engineers/day)
   - Track metrics

---

## REPORT FORMAT

After completing all steps, provide this report:

```
=== DEPLOYMENT COMPLETED ===

BACKUPS CREATED:
- Code: /root/backups/nppe-main-YYYYMMDD-HHMMSS.tar.gz
- Frontend: /root/backups/frontend-out-YYYYMMDD-HHMMSS/

BACKEND:
- Old PID: 369843, 369881 (killed)
- New PID: <NEW_PID>
- Port 8889: LISTENING ✅
- Health check: OK ✅
- Logs: No errors ✅

FRONTEND:
- Build: SUCCESS ✅
- Files in out/: <count> files
- Nginx: RELOADED ✅

GIT:
- Branch: claude/backend-generation-prompt-01SMdkWyoFXTtghbRbPkt58j ✅
- Latest commit: <commit hash and message>

VERIFICATION:
- curl http://localhost:8889/health: {"status":"ok"} ✅
- curl https://nppe.mshtechlab.com: 200 OK ✅
- Backend logs: No errors ✅
- Nginx logs: No errors ✅

STATUS: DEPLOYMENT SUCCESSFUL ✅

ISSUES (if any):
- None OR list issues encountered

NEXT STEPS:
1. Test website at https://nppe.mshtechlab.com
2. Integrate real Stripe API (currently using mocks)
3. Launch marketing campaign
```

---

## START DEPLOYMENT

Execute all steps in order and provide the final report when complete.

**Estimated time:** 5-7 minutes

Good luck! 🚀
