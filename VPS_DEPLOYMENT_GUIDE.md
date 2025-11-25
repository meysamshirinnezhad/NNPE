# VPS Deployment Guide - NPPE Platform Update

This guide walks you through deploying the new features to your VPS, including:
- High-converting landing page
- Fixed dashboard analytics
- Stripe subscription system
- All backend improvements

---

## 📋 Prerequisites

Before starting, ensure you have:
- SSH access to your VPS
- Git installed on VPS
- Go 1.23+ installed
- Node.js 18+ and npm installed
- PostgreSQL running
- Systemd service configured (or equivalent)

---

## 🚀 Quick Deployment (5 Minutes)

If you're experienced, here's the quick version:

```bash
# SSH into VPS
ssh user@your-vps-ip

# Navigate to project
cd /path/to/NNPE

# Pull latest changes
git fetch origin
git checkout claude/backend-generation-prompt-01SMdkWyoFXTtghbRbPkt58j
git pull origin claude/backend-generation-prompt-01SMdkWyoFXTtghbRbPkt58j

# Backend: Rebuild and restart
cd back
go build -o nppe-backend cmd/main.go
sudo systemctl restart nppe-backend

# Frontend: Rebuild
cd ../front
npm install
npm run build

# Copy build to web server location
sudo cp -r dist/* /var/www/nppe/

# Verify
curl http://localhost:8080/health
```

**Continue to detailed steps below if you need guidance.**

---

## 📖 Detailed Step-by-Step Deployment

### Step 1: Connect to Your VPS

```bash
ssh your-username@your-vps-ip
```

Example:
```bash
ssh root@192.168.1.100
# or
ssh ubuntu@nppe-platform.com
```

---

### Step 2: Navigate to Project Directory

```bash
cd /path/to/NNPE
```

Common locations:
```bash
cd /var/www/NNPE
# or
cd /home/ubuntu/NNPE
# or
cd ~/NNPE
```

**Verify you're in the right place:**
```bash
ls -la
# Should see: back/ front/ README.md, etc.
```

---

### Step 3: Backup Current Version (Recommended)

Create a backup before deploying:

```bash
# Backup current backend binary
sudo cp /path/to/current/nppe-backend /path/to/current/nppe-backend.backup.$(date +%Y%m%d)

# Backup frontend build
sudo cp -r /var/www/nppe /var/www/nppe.backup.$(date +%Y%m%d)
```

Example:
```bash
sudo cp /usr/local/bin/nppe-backend /usr/local/bin/nppe-backend.backup.20250125
sudo cp -r /var/www/nppe /var/www/nppe.backup.20250125
```

---

### Step 4: Pull Latest Code from Git

```bash
# Fetch all branches
git fetch origin

# Switch to the new branch
git checkout claude/backend-generation-prompt-01SMdkWyoFXTtghbRbPkt58j

# Pull latest changes
git pull origin claude/backend-generation-prompt-01SMdkWyoFXTtghbRbPkt58j
```

**Expected output:**
```
Switched to branch 'claude/backend-generation-prompt-01SMdkWyoFXTtghbRbPkt58j'
Already up to date.
```

**Verify changes pulled:**
```bash
git log --oneline -5
```

You should see commits like:
- "Add first 10 sales implementation checklist"
- "Complete high-converting landing page + backend fixes"

---

### Step 5: Update Environment Variables

Add Stripe configuration (if not already present):

```bash
nano /path/to/.env
# or
nano back/.env
```

**Add these lines:**
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_test_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Product IDs (get these from Stripe dashboard)
STRIPE_MONTHLY_PRICE_ID=price_monthly_id_here
STRIPE_ANNUAL_PRICE_ID=price_annual_id_here
```

**To get Stripe keys:**
1. Create account at https://stripe.com
2. Go to Developers → API keys
3. Copy "Secret key" and "Publishable key"
4. Create products at https://dashboard.stripe.com/products
5. Copy price IDs

**Note:** Start with test mode keys (sk_test_..., pk_test_...)

---

### Step 6: Deploy Backend

#### 6.1 Build Go Backend

```bash
cd back

# Download dependencies
go mod download

# Build binary
go build -o nppe-backend cmd/main.go
```

**Expected output:**
```
go: downloading github.com/gin-gonic/gin v1.9.1
...
[Build successful - no output means success]
```

**Verify binary created:**
```bash
ls -lh nppe-backend
# Should show: -rwxr-xr-x 1 user user 25M Jan 25 10:30 nppe-backend
```

#### 6.2 Stop Current Backend Service

**If using systemd:**
```bash
sudo systemctl stop nppe-backend
```

**If using custom script:**
```bash
# Find process
ps aux | grep nppe-backend

# Kill process
sudo kill -9 <PID>
```

#### 6.3 Replace Binary

```bash
# Copy new binary to installation location
sudo cp nppe-backend /usr/local/bin/nppe-backend

# Set permissions
sudo chmod +x /usr/local/bin/nppe-backend
```

**Alternative locations:**
```bash
# If binary runs from project directory
sudo cp nppe-backend /var/www/NNPE/back/nppe-backend
```

#### 6.4 Restart Backend Service

**If using systemd:**
```bash
sudo systemctl start nppe-backend
sudo systemctl status nppe-backend
```

**Expected output:**
```
● nppe-backend.service - NPPE Backend API
   Loaded: loaded (/etc/systemd/system/nppe-backend.service; enabled)
   Active: active (running) since Thu 2025-01-25 10:35:22 UTC; 5s ago
```

**If NOT using systemd, start manually:**
```bash
cd /path/to/NNPE/back
nohup ./nppe-backend > logs/backend.log 2>&1 &
```

#### 6.5 Verify Backend Running

```bash
# Check health endpoint
curl http://localhost:8080/health

# Expected response:
# {"status":"ok"}

# Check logs
sudo journalctl -u nppe-backend -n 50 -f
# or
tail -f logs/backend.log
```

**Look for:**
```
[GIN] Listening and serving HTTP on :8080
Database connected successfully
Redis connected successfully
```

---

### Step 7: Deploy Frontend

#### 7.1 Install Dependencies

```bash
cd /path/to/NNPE/front

npm install
```

**This will install any new packages needed for the new landing page.**

#### 7.2 Build Production Frontend

```bash
npm run build
```

**Expected output:**
```
vite v6.0.1 building for production...
✓ 1234 modules transformed.
dist/index.html                   0.45 kB
dist/assets/index-abc123.js      245.23 kB
✓ built in 12.34s
```

**Verify build created:**
```bash
ls -la dist/
# Should see: index.html, assets/, favicon.ico, etc.
```

#### 7.3 Deploy Frontend Build

**If using Nginx:**
```bash
# Remove old build
sudo rm -rf /var/www/nppe/*

# Copy new build
sudo cp -r dist/* /var/www/nppe/

# Set permissions
sudo chown -R www-data:www-data /var/www/nppe
sudo chmod -R 755 /var/www/nppe
```

**If using Apache:**
```bash
sudo rm -rf /var/www/html/nppe/*
sudo cp -r dist/* /var/www/html/nppe/
sudo chown -R www-data:www-data /var/www/html/nppe
```

#### 7.4 Restart Web Server

**Nginx:**
```bash
sudo systemctl restart nginx
sudo systemctl status nginx
```

**Apache:**
```bash
sudo systemctl restart apache2
sudo systemctl status apache2
```

---

### Step 8: Verify Deployment

#### 8.1 Check Backend Endpoints

**Test health endpoint:**
```bash
curl http://localhost:8080/health
# Expected: {"status":"ok"}
```

**Test new subscription endpoint:**
```bash
curl -X GET http://localhost:8080/api/subscriptions/current \
  -H "Authorization: Bearer YOUR_TEST_TOKEN"
# Expected: {"error":"no active subscription found"} or subscription data
```

**Test dashboard analytics (fixed endpoint):**
```bash
curl -X GET http://localhost:8080/api/dashboard \
  -H "Authorization: Bearer YOUR_TEST_TOKEN"
# Expected: JSON with topic_mastery, weak_topics arrays (no longer empty)
```

#### 8.2 Check Frontend

**Visit in browser:**
```
http://your-domain.com/landing
```

**You should see:**
- ✅ New landing page with "Pass Your NPPE Exam with Confidence" headline
- ✅ Email capture field
- ✅ Single "Start Free Practice Test" button
- ✅ No navigation links at top
- ✅ Honest messaging (no fake "95% pass rate")

**Test redirect from root:**
```
http://your-domain.com/
```
- Should redirect to `/landing` if not logged in
- Should redirect to `/dashboard` if logged in

#### 8.3 Test Full User Flow

1. **Visit landing page** → Enter email → Click "Start Free Practice Test"
2. **Signup page** → Create account
3. **Dashboard** → Check that "Topic Mastery" shows data (not empty)
4. **Try subscription** → Go to `/settings/subscription` → Check if subscription page loads

---

### Step 9: Monitor for Issues

#### 9.1 Watch Backend Logs

```bash
# Systemd
sudo journalctl -u nppe-backend -f

# Manual
tail -f /path/to/logs/backend.log
```

**Look for errors:**
- Database connection issues
- Missing environment variables
- API endpoint errors

#### 9.2 Watch Web Server Logs

```bash
# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

#### 9.3 Check System Resources

```bash
# CPU and memory usage
htop

# Disk space
df -h
```

---

## 🔧 Troubleshooting

### Issue: Backend won't start

**Check logs:**
```bash
sudo journalctl -u nppe-backend -n 100
```

**Common causes:**
- Port 8080 already in use → Change port in config or kill process
- Database not running → `sudo systemctl start postgresql`
- Missing environment variables → Check `.env` file

### Issue: Frontend shows old landing page

**Clear browser cache:**
- Ctrl+Shift+R (hard refresh)
- Or open in incognito mode

**Verify correct build deployed:**
```bash
cat /var/www/nppe/index.html | grep "Pass Your NPPE"
# Should find text if new version deployed
```

**Check Nginx serving correct directory:**
```bash
sudo nano /etc/nginx/sites-available/nppe
# root should point to /var/www/nppe or wherever you deployed
```

### Issue: Dashboard still shows empty arrays

**Check backend logs for SQL errors:**
```bash
sudo journalctl -u nppe-backend | grep ERROR
```

**Verify database has data:**
```bash
psql -U your_db_user -d nppe_db
SELECT COUNT(*) FROM user_answers;
# Should return > 0 if users have answered questions
```

**If no data yet:** Dashboard will show real data once users start answering questions.

### Issue: Subscription endpoint returns 404

**Check routes registered:**
```bash
curl http://localhost:8080/api/subscriptions/current
```

**If 404:** Ensure new routes added to `back/cmd/main.go`:
```go
subscriptionHandler := handlers.NewSubscriptionHandler(db)
api.POST("/subscriptions", subscriptionHandler.CreateSubscription)
api.GET("/subscriptions/current", subscriptionHandler.GetSubscription)
api.DELETE("/subscriptions/current", subscriptionHandler.CancelSubscription)
api.POST("/webhooks/stripe", subscriptionHandler.StripeWebhook)
```

---

## 🔄 Rollback Procedures

If something goes wrong, rollback to previous version:

### Rollback Backend

```bash
# Stop new version
sudo systemctl stop nppe-backend

# Restore backup
sudo cp /usr/local/bin/nppe-backend.backup.20250125 /usr/local/bin/nppe-backend

# Start old version
sudo systemctl start nppe-backend
```

### Rollback Frontend

```bash
# Remove new build
sudo rm -rf /var/www/nppe/*

# Restore backup
sudo cp -r /var/www/nppe.backup.20250125/* /var/www/nppe/

# Restart web server
sudo systemctl restart nginx
```

### Rollback Git

```bash
cd /path/to/NNPE

# Switch back to main/master
git checkout main

# Or checkout previous commit
git log --oneline -10
git checkout <previous-commit-hash>
```

---

## 📊 Post-Deployment Checklist

After deployment, verify:

- [ ] Backend health endpoint responding: `curl http://localhost:8080/health`
- [ ] Frontend accessible at your domain
- [ ] New landing page visible at `/landing`
- [ ] Root `/` redirects correctly (logged out → `/landing`, logged in → `/dashboard`)
- [ ] Dashboard analytics showing data (if users have answered questions)
- [ ] Subscription endpoints accessible (even if returning mock data)
- [ ] No errors in backend logs: `sudo journalctl -u nppe-backend -n 50`
- [ ] No errors in web server logs: `sudo tail -n 50 /var/log/nginx/error.log`

---

## 🎯 Next Steps After Deployment

### 1. Stripe Integration (CRITICAL for accepting payments)

The subscription system is currently using **mock data**. Before you can accept real payments:

**Replace mock code in `back/internal/handlers/subscription_handler.go`:**

Current (lines 67-76):
```go
// TODO: Replace with real Stripe API
StripeCustomerID:     fmt.Sprintf("cus_mock_%s", userID),
StripeSubscriptionID: fmt.Sprintf("sub_mock_%s", uuid.New().String()),
```

Replace with:
```go
// Create real Stripe customer
stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
customer, err := customer.New(&stripe.CustomerParams{
    Email: stripe.String(user.Email),
    Name:  stripe.String(fmt.Sprintf("%s %s", user.FirstName, user.LastName)),
})

// Create real Stripe subscription
subscription, err := subscription.New(&stripe.SubscriptionParams{
    Customer: stripe.String(customer.ID),
    Items: []*stripe.SubscriptionItemsParams{
        {Price: stripe.String(priceID)},
    },
})

StripeCustomerID:     customer.ID,
StripeSubscriptionID: subscription.ID,
```

**Install Stripe Go SDK:**
```bash
cd back
go get github.com/stripe/stripe-go/v76
go build -o nppe-backend cmd/main.go
```

**Redeploy backend** after Stripe integration.

### 2. Test Payment Flow End-to-End

1. Visit `/landing` → Signup
2. Go to `/settings/subscription`
3. Try to create subscription with test card: `4242 4242 4242 4242`
4. Verify subscription appears in Stripe dashboard
5. Verify subscription saved in your database

### 3. Set Up Stripe Webhooks

Configure webhook in Stripe dashboard to send events to:
```
https://your-domain.com/api/webhooks/stripe
```

Events to listen for:
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### 4. Launch Marketing Campaign

Follow the guide in `LINKEDIN_LAUNCH_POST.md`:
- Post on LinkedIn (use primary post template)
- Message 20-30 engineers/day
- Track metrics daily

---

## 📁 Files Changed in This Deployment

### Frontend:
- `front/src/pages/landing/ConversionFocusedLanding.tsx` (NEW - 300 lines)
- `front/src/router/config.tsx` (MODIFIED - 1 line)

### Backend:
- `back/internal/handlers/dashboard_handler.go` (REWRITTEN - 710 lines)
- `back/internal/handlers/subscription_handler.go` (NEW - 250 lines)

### Documentation:
- `BACKEND_GENERATION_PROMPT.md` (NEW)
- `FRONTEND_BACKEND_GAP_ANALYSIS.md` (NEW)
- `LANDING_PAGE_OPTIMIZATION.md` (NEW)
- `LANDING_PAGE_BEFORE_AFTER.md` (NEW)
- `LINKEDIN_LAUNCH_POST.md` (NEW)
- `FIRST_10_SALES_CHECKLIST.md` (NEW)
- `VPS_DEPLOYMENT_GUIDE.md` (NEW - this file)

---

## 🆘 Getting Help

If you encounter issues:

1. **Check logs first:**
   ```bash
   sudo journalctl -u nppe-backend -n 100
   tail -f /var/log/nginx/error.log
   ```

2. **Verify environment variables:**
   ```bash
   cat back/.env | grep STRIPE
   ```

3. **Test specific endpoint:**
   ```bash
   curl -v http://localhost:8080/api/dashboard
   ```

4. **Database connection:**
   ```bash
   psql -U your_user -d nppe_db -c "SELECT COUNT(*) FROM users;"
   ```

---

## ✅ Deployment Complete!

If all checks pass, your deployment is successful!

**What changed:**
- ✅ High-converting landing page deployed (3-5x better conversion expected)
- ✅ Dashboard analytics now showing real data
- ✅ Subscription system endpoints ready (needs Stripe API integration)
- ✅ All marketing materials ready for launch

**Next action:** Follow `FIRST_10_SALES_CHECKLIST.md` to launch and get your first 10 customers!

---

## 📞 Quick Reference Commands

```bash
# Restart backend
sudo systemctl restart nppe-backend

# Restart Nginx
sudo systemctl restart nginx

# View backend logs
sudo journalctl -u nppe-backend -f

# View web server logs
sudo tail -f /var/log/nginx/error.log

# Rebuild frontend
cd front && npm run build && sudo cp -r dist/* /var/www/nppe/

# Rebuild backend
cd back && go build -o nppe-backend cmd/main.go && sudo systemctl restart nppe-backend

# Check running processes
ps aux | grep nppe

# Check ports in use
sudo netstat -tlnp | grep :8080
```

---

**Good luck with your deployment! 🚀**
