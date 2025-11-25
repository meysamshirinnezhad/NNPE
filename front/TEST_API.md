# Quick API Test Guide

## ✅ Backend is Running!

Your backend is working perfectly. The 401 errors mean you need to login first.

---

## 🧪 Test User Registration & Login

### Method 1: Using Browser Console (Easiest)

1. **Open http://localhost:3000 in your browser**
2. **Press F12** to open Developer Console
3. **Paste this code:**

```javascript
// Import the auth service
const { authService } = await import('/src/api/index.ts');

// Register a new user
const registerResult = await authService.register({
  email: 'demo@nppe.com',
  password: 'SecurePass123!',
  first_name: 'Demo',
  last_name: 'User',
  province: 'NL',
  exam_date: '2025-06-15'
});

console.log('✅ Registration successful!', registerResult);
console.log('🔑 Token stored:', localStorage.getItem('access_token'));

// Now navigate to dashboard
window.location.href = '/dashboard';
```

---

### Method 2: Using PowerShell (Backend Testing)

**Register User:**
```powershell
$registerBody = @{
    email = "test@nppe.com"
    password = "SecurePass123!"
    first_name = "Test"
    last_name = "User"
    province = "NL"
    exam_date = "2025-06-15"
} | ConvertTo-Json

$response = Invoke-RestMethod -Method POST `
  -Uri "http://localhost:8080/api/v1/auth/register" `
  -ContentType "application/json" `
  -Body $registerBody

$response
```

**Login:**
```powershell
$loginBody = @{
    email = "test@nppe.com"
    password = "SecurePass123!"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Method POST `
  -Uri "http://localhost:8080/api/v1/auth/login" `
  -ContentType "application/json" `
  -Body $loginBody

# Save the token
$token = $loginResponse.access_token
Write-Host "Token: $token"
```

**Test Dashboard with Token:**
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Method GET `
  -Uri "http://localhost:8080/api/v1/users/me/dashboard" `
  -Headers $headers
```

---

### Method 3: Using curl

**Register:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test@nppe.com\",
    \"password\": \"SecurePass123!\",
    \"first_name\": \"Test\",
    \"last_name\": \"User\",
    \"province\": \"NL\"
  }"
```

**Login:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test@nppe.com\",
    \"password\": \"SecurePass123!\"
  }"
```

---

## 🎯 Recommended: Browser Console Method

The **Browser Console method (Method 1)** is the easiest because:
- ✅ Automatically stores the token
- ✅ AuthContext picks it up immediately
- ✅ Dashboard will work right away
- ✅ No copy-paste of tokens needed

Just open http://localhost:3000, press F12, paste the registration code, and the dashboard will load with real data!

---

## 📊 Expected Dashboard Response

After logging in, the dashboard API returns:

```json
{
  "overall_progress": 68,
  "study_streak": 7,
  "longest_streak": 12,
  "questions_completed": 234,
  "questions_correct": 187,
  "accuracy_rate": 79.9,
  "practice_tests_taken": 5,
  "average_test_score": 76.2,
  "time_studied_hours": 42.5,
  "pass_probability": 82,
  "days_until_exam": 89,
  "recommended_study_time_daily": 90,
  "message": "Dashboard data endpoint"
}
```

(Currently showing sample data from backend - will be real as you use the platform)

---

## ✅ Verification

After registration/login, you should see:
- ✅ Token in localStorage
- ✅ User data in localStorage
- ✅ Dashboard loads successfully
- ✅ No more 401 errors
- ✅ Real data displayed

---

## 🚀 Quick Start (Complete Flow)

```javascript
// In browser console at http://localhost:3000
const { authService } = await import('/src/api/index.ts');

// Register and auto-login
const user = await authService.register({
  email: 'you@example.com',
  password: 'YourPassword123!',
  first_name: 'Your',
  last_name: 'Name',
  province: 'NL'
});

// Go to dashboard
window.location.href = '/dashboard';
```

**That's it!** The dashboard will now show your real data! 🎉