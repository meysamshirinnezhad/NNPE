# Email Verification Implementation - ProCertFlo

## ✅ Backend Implementation Complete

### Database Changes
- **Migration**: `008_add_email_verification_fields.sql`
- **Added Fields**:
  - `email_verified_at` - timestamp when email was verified
  - `email_verify_token_hash` - SHA-256 hash of verification token
  - `email_verify_expires_at` - token expiration timestamp
  - `email_verify_sent_at` - tracking when verification email was sent
- **Indexes**: Optimized for fast lookups on token hash and expiration
- **Functions**: 
  - `can_send_verification_email()` - Rate limiting check
  - `cleanup_expired_verification_tokens()` - Cleanup utility

### User Model Updates
- **File**: `internal/models/user.go`
- **Enhanced with email verification fields**:
  - `EmailVerifiedAt *time.Time`
  - `EmailVerifyTokenHash string`
  - `EmailVerifyExpiresAt *time.Time`
  - `EmailVerifySentAt *time.Time`

### Email Service
- **File**: `internal/services/email_service.go`
- **Features**:
  - Gmail SMTP integration (smtp.gmail.com:587)
  - Secure token generation using crypto/rand
  - SHA-256 token hashing for storage
  - Beautiful HTML email templates
  - Professional branding for ProCertFlo

### Email Verification Endpoints

#### 1. Send Verification Email
```http
POST /v1/auth/send-verification
Authorization: Bearer <jwt_token>
```
**Features**:
- Rate limited: Max 1 email per hour
- Requires authenticated user
- Generates 32-byte secure token
- Sends professional HTML email
- Updates tracking timestamps

#### 2. Verify Email
```http
GET /v1/auth/verify-email/{token}
```
**Features**:
- Validates token hash and expiration
- Sets user as verified
- Clears verification tokens
- Returns success message

### Environment Variables Required
Add to your `.env`:
```bash
# Gmail SMTP Configuration
GMAIL_SMTP_USER=your-email@gmail.com
GMAIL_SMTP_PASS=your-app-password
APP_BASE_URL=http://localhost:5173
```

## 🔒 Security Features

### Token Security
- **Cryptographically Secure**: Uses crypto/rand for token generation
- **Hashed Storage**: SHA-256 hash stored in database, never plain text
- **Expiration**: 1-hour token expiration
- **Rate Limiting**: Max 1 verification email per hour per user

### Email Security
- **No Plain Text**: All sensitive data hashed
- **Secure SMTP**: STARTTLS encryption on port 587
- **App Password**: Requires Gmail App Password, not regular password

## 🚀 Frontend Implementation Required

### Email Verification UI Components

#### 1. Verification Banner (Account Dashboard)
```jsx
import React from 'react';

const EmailVerificationBanner = ({ isVerified, onSendVerification, isLoading }) => {
  if (isVerified) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            Please verify your email address to purchase exam credits.
            <button
              onClick={onSendVerification}
              disabled={isLoading}
              className="ml-2 text-yellow-800 underline hover:text-yellow-900"
            >
              {isLoading ? 'Sending...' : 'Send verification email'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
```

#### 2. Purchase Button Guard
```jsx
const PurchaseButton = ({ isVerified, onClick, children }) => {
  if (!isVerified) {
    return (
      <button
        onClick={() => alert('Please verify your email first')}
        className="bg-gray-400 text-white px-6 py-3 rounded-lg cursor-not-allowed"
        title="Verify your email to continue"
      >
        🔒 Verify Email to Purchase
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
    >
      {children}
    </button>
  );
};
```

#### 3. Email Verification API Hook
```jsx
import { useState } from 'react';
import { api } from '../api/client';

export const useEmailVerification = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendVerificationEmail = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/send-verification');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  return { sendVerificationEmail, loading, error };
};
```

### Verify Email Page

#### 1. VerifyEmailPage Component
```jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      await api.get(`/auth/verify-email/${token}`);
      setStatus('success');
      setMessage('Email verified successfully! You can now purchase exam credits.');
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Verification failed');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        {status === 'success' ? (
          <>
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Go to Dashboard
            </button>
          </>
        ) : (
          <>
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
            >
              Back to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
```

### Purchase Flow Updates

#### 1. Updated Dashboard Integration
```jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import EmailVerificationBanner from '../components/EmailVerificationBanner';
import PurchaseButton from '../components/PurchaseButton';

const Dashboard = () => {
  const { user } = useAuth();
  const { sendVerificationEmail, loading } = useEmailVerification();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <EmailVerificationBanner
        isVerified={user.is_verified}
        onSendVerification={sendVerificationEmail}
        isLoading={loading}
      />

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Purchase Exam Credits</h2>
        <p className="text-gray-600 mb-6">
          Get access to 3 mock exams for $59.99 CAD
        </p>
        
        <PurchaseButton
          isVerified={user.is_verified}
          onClick={() => {/* Navigate to checkout */}}
        >
          Buy 3 Mock Exams - $59.99 CAD
        </PurchaseButton>
      </div>
    </div>
  );
};
```

## 🎯 Next Steps for Complete Implementation

### 1. Stripe Checkout Session Endpoint
Create `POST /v1/billing/create-checkout-session` endpoint:
```go
// Requires authenticated + verified user
// Creates Stripe checkout session for $59.99 CAD
// Returns session.url for frontend redirect
```

### 2. Frontend Route Setup
Add to your router:
```jsx
import VerifyEmailPage from './pages/VerifyEmailPage';

const routes = [
  // ... existing routes
  { path: '/verify-email', component: VerifyEmailPage },
];
```

### 3. Database Migration
Run the migration:
```bash
psql -d your_database -f migrations/008_add_email_verification_fields.sql
```

## 🔧 Testing

### Manual Testing Steps

1. **Test Registration Flow**:
   - Register new user
   - Check email (sent via Gmail SMTP)
   - Click verification link
   - Verify email status updated

2. **Test Rate Limiting**:
   - Send verification email
   - Try to send again within 1 hour
   - Should return 429 error

3. **Test Purchase Flow**:
   - Login unverified user
   - Try to purchase (button should be disabled)
   - Verify email
   - Try to purchase (button should be enabled)

### Environment Setup
1. Set Gmail App Password in environment
2. Configure APP_BASE_URL
3. Run database migration
4. Test email sending

## 📋 Production Checklist

- [ ] Set production Gmail credentials
- [ ] Configure production APP_BASE_URL
- [ ] Run database migration
- [ ] Test email delivery in production
- [ ] Set up monitoring for failed emails
- [ ] Configure rate limiting
- [ ] Test complete user flow

The email verification system is now ready for frontend integration and testing!
