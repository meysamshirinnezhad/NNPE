# NPPE Platform Configuration Report
Generated on: 2025-11-26 02:42:41 UTC

## === CONFIGURATION ===
1. **Project**: /root/Learning-platform/source
2. **Backend Binary**: Manual Go process (no systemd service)
   - Process: PID 369843/369881 running "cd back && go run cmd/api/main.go"
3. **Backend Service**: Manual process via Go runtime
   - Command: `cd back && /usr/local/go/bin/go run cmd/api/main.go`
4. **Backend Port**: 8889 (TCP6 listening on :::8889)
5. **Env File**: /root/Learning-platform/source/back/.env
6. **Web Server**: nginx (active/running since Nov 16, 2025)
7. **Frontend Root**: /root/Learning-platform/source/front/out (nginx configured)
8. **Domain**: nppe.mshtechlab.com
9. **Database**: PostgreSQL 14 running, database: nppe_db
10. **Git Branch**: main (up to date with origin/main)

## Detailed Configuration

### Backend Configuration
- **Port**: 8889
- **Environment**: production
- **Database URL**: postgres://nppe:StrongP@ss_123@localhost:5432/nppe?sslmode=disable
- **Redis**: redis://localhost:6379
- **JWT Secret**: Configured (production key)
- **Frontend URL**: https://nppe.mshtechlab.com
- **OAuth**: Google and Apple configured
- **Stripe**: Configured for payments
- **AWS S3**: Configured for uploads

### Frontend Configuration
- **Web Server**: nginx (systemd service active)
- **Domain**: nppe.mshtechlab.com
- **SSL**: Cloudflare certificates configured
- **Configuration**: /etc/nginx/sites-available/nppe.mshtechlab.com
- **Frontend Path**: /root/Learning-platform/source/front/out
- **API Proxy**: /api/ -> http://127.0.0.1:8889/
- **WebSocket**: /ws/ -> http://127.0.0.1:8889/ws/

### Database Configuration
- **Service**: PostgreSQL 14 (active since Nov 3, 2025)
- **Main PID**: 812
- **Configuration**: /var/lib/postgresql/14/main
- **Database**: nppe
- **User**: nppe
- **Connection Pool**: Max 100 connections, 10 idle

### System Environment
- **Go Version**: go1.24.3 linux/amd64
- **Node Version**: v18.20.8
- **NPM Version**: 10.8.2

### Git Repository
- **Repository**: https://github.com/meysamshirinnezhad/NNPE.git
- **Branch**: main
- **Status**: Clean (up to date with origin/main)
- **Untracked Files**: 3 files present

## Service Status Summary
- ✅ nginx: Active (running)
- ✅ PostgreSQL: Active (running)
- ✅ Backend API: Running on port 8889
- ✅ Redis: Configured
- ✅ SSL: Configured with Cloudflare certificates

## Security Configuration
- **HTTPS Redirect**: 80 -> 443 (301)
- **SSL Protocols**: TLSv1.2, TLSv1.3
- **Security Headers**: X-Frame-Options, X-Content-Type-Options configured
- **Cookie Security**: Secure=true, SameSite=None
- **Rate Limiting**: 60 requests per minute

## Deployment Notes
- Backend runs as manual Go process (not daemonized via systemd)
- Frontend built to /root/Learning-platform/source/front/out (currently empty)
- Static assets caching configured for /assets/ path
- Access logs disabled for performance
- WebSocket support configured
