# ProCertFlo Email Verification - Deployment Commands

## 🚀 Quick Deployment Commands

After implementing the email verification system, use these commands to build and restart services:

### Full System Build & Restart
```bash
# Backend
cd back && go run cmd/api/main.go
sudo systemctl restart nppe-api

# Nginx
sudo systemctl restart nginx
sudo systemctl status nginx

# Frontend
cd front && npm run build
sudo systemctl restart nppe-frontend
```

## 📋 Complete Deployment Sequence

### 1. Database Migration
```bash
# First, run the email verification migration
psql -d your_database -f migrations/008_add_email_verification_fields.sql
```

### 2. Backend Deployment
```bash
cd back
# Install dependencies
go mod tidy
# Build and run
go run cmd/api/main.go

# In production, restart the service
sudo systemctl restart nppe-api
```

### 3. Nginx Deployment
```bash
# Restart Nginx to pick up any configuration changes
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

### 4. Frontend Deployment
```bash
cd front
# Install dependencies
npm install
# Build for production
npm run build

# In production, restart the service
sudo systemctl restart nppe-frontend
```

## 🔧 Environment Variables

Make sure these are set in production:

### Backend (.env)
```bash
# Email Verification
GMAIL_SMTP_USER=your-production-email@gmail.com
GMAIL_SMTP_PASS=your-app-password
APP_BASE_URL=https://yourdomain.com

# Stripe
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
```

### Frontend (.env.production)
```bash
VITE_API_BASE_URL=https://yourdomain.com/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key
```

## 🧪 Post-Deployment Testing

### 1. Test Backend Health
```bash
curl https://yourdomain.com/health
```

### 2. Test Email Verification
```bash
# Register a test user
curl -X POST https://yourdomain.com/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@yourdomain.com",
    "password": "testpassword123",
    "first_name": "Test",
    "last_name": "User",
    "province": "Ontario"
  }'

# Send verification email
curl -X POST https://yourdomain.com/v1/auth/send-verification \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Test Purchase Protection
```bash
# This should fail with EMAIL_NOT_VERIFIED
curl -X POST https://yourdomain.com/v1/billing/create-checkout-session \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price_id": "price_your_stripe_price_id",
    "success_url": "https://yourdomain.com/success",
    "cancel_url": "https://yourdomain.com/cancel"
  }'
```

## 📊 Monitoring

### Check Service Status
```bash
# Backend service
sudo systemctl status nppe-api

# Nginx status
sudo systemctl status nginx

# Frontend service  
sudo systemctl status nppe-frontend
```

### Check Logs
```bash
# Backend logs
sudo journalctl -u nppe-api -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## 🔐 Production Security Checklist

- [ ] Gmail App Password configured
- [ ] SSL certificates installed
- [ ] Firewall configured (ports 80, 443, 22)
- [ ] Database backup strategy in place
- [ ] Environment variables secured
- [ ] Stripe webhooks configured
- [ ] Email delivery monitoring set up
- [ ] Rate limiting configured
- [ ] Log rotation configured

## 🚨 Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check logs
sudo journalctl -u nppe-api --no-pager

# Common issues:
# - Missing environment variables
# - Database connection failed
# - Port already in use
```

**Email not sending:**
```bash
# Check Gmail App Password
# Verify SMTP credentials
# Check firewall rules for port 587
```

**Frontend build fails:**
```bash
cd front && npm install
npm run build
```

**Stripe webhook issues:**
```bash
# Verify webhook endpoint is accessible
curl -X POST https://yourdomain.com/v1/webhooks/stripe \
  -H "Stripe-Signature: test"
```

## ✅ Success Indicators

- [ ] Backend service running (`sudo systemctl status nppe-api` shows active)
- [ ] Nginx serving frontend and proxying backend
- [ ] Email verification emails being sent
- [ ] Purchase flow protected (returns EMAIL_NOT_VERIFIED for unverified users)
- [ ] Webhook processing Stripe payments
- [ ] Users can verify email and purchase credits
- [ ] Existing coupon system still works

Your email verification system is now production-ready! 🎉
