# Password Reset Implementation Summary (FR-Auth-03)

## Overview
Complete implementation of password reset functionality with secure token-based approach, email notifications, and token expiration.

## Backend Implementation

### 1. New Entities & Repositories

**PasswordReset Entity** (`scheduling/entity/PasswordReset.java`)
- Stores reset tokens with user association
- Tracks token expiration time
- Marks tokens as used to prevent reuse
- Helper methods: `isExpired()`, `isValid()`

**PasswordResetRepository** (`scheduling/repository/PasswordResetRepository.java`)
- Manages PasswordReset entities
- Custom queries for token lookup and validation

### 2. Security & Utilities

**TokenGenerator** (`scheduling/util/TokenGenerator.java`)
- Generates cryptographically secure tokens
- 32-byte random tokens encoded in Base64
- Prevents token prediction attacks

**EmailService** (`scheduling/util/EmailService.java`)
- Sends password reset emails
- Includes reset token and expiration info
- Fallback to console logging for development (when mail not configured)
- Configurable reset URL for frontend integration

### 3. Authentication Endpoints

**AuthController** - New Endpoints:

1. **POST /api/auth/forgot-password**
   - Request: `{ "email": "user@example.com" }`
   - Response: Success message (always, for security)
   - Invalidates existing reset tokens for user
   - Generates new token with 1-hour expiration
   - Sends email with reset link

2. **POST /api/auth/reset-password**
   - Request: `{ "token": "xxxxx", "newPassword": "password" }`
   - Response: Success message
   - Validates token expiration and usage
   - Enforces password strength (min 6 chars)
   - Updates user password
   - Marks token as used

3. **GET /api/auth/validate-reset-token/{token}**
   - Returns: `{ "valid": true/false }`
   - Used by frontend to validate tokens

### 4. Configuration

**application.properties** - Email Setup:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME:}
spring.mail.password=${MAIL_PASSWORD:}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.from=noreply@trainersub.com
app.reset-password-url=http://localhost:3000/reset-password
```

**pom.xml** - Dependencies:
- Added `spring-boot-starter-mail` for email support

## Frontend Implementation

### 1. Pages

**ForgotPasswordPage** (`pages/auth/ForgotPasswordPage.js`)
- Email input with validation
- Handles successful submission feedback
- Security: Same response for existing/non-existing emails
- User-friendly success message

**ResetPasswordPage** (`pages/auth/ResetPasswordPage.js`)
- Extracts token from URL query parameter
- Auto-validates token on load
- Password and confirm password inputs
- Show/hide password toggle
- Password strength validation (min 6 chars)
- Auto-redirect to login on success
- Handles expired/used tokens gracefully

**LoginPage** (`pages/auth/LoginPage.js`)
- Email and password inputs
- Show/hide password functionality
- "Forgot Password?" link to reset flow
- Role-based redirect after login
- Error handling and user feedback

**RegisterPage** (`pages/auth/RegisterPage.js`)
- Full name, email, password inputs
- Role selection (Student/Trainer)
- Password confirmation
- Password strength requirements
- Comprehensive validation

### 2. Services

**authService.js** - New Methods:
```javascript
forgotPassword(data)      // POST /api/auth/forgot-password
resetPassword(data)       // POST /api/auth/reset-password
validateResetToken(token) // GET /api/auth/validate-reset-token/{token}
```

### 3. Routing

**App.js** - New Routes:
- `/forgot-password` → ForgotPasswordPage
- `/reset-password?token=xxxxx` → ResetPasswordPage
- Updated: `/login` and `/register` routes

### 4. Styling

**AuthPages.css** - Login/Register styling
**PasswordResetPages.css** - Password reset pages styling

Modern gradient design with:
- Responsive layout (mobile-friendly)
- Form validation feedback
- Password visibility toggle
- Error/success messages
- Smooth transitions and animations

## Security Features

1. **Token Security**
   - Cryptographically secure random generation (32 bytes)
   - Base64 URL-safe encoding
   - 1-hour expiration
   - Single-use (marked as used after reset)
   - Unique per user

2. **Password Security**
   - BCryptPasswordEncoder for hashing
   - Minimum 6 characters requirement
   - Confirmation match validation
   - No password stored in reset links

3. **User Privacy**
   - Same response for existing/non-existing emails (prevents email enumeration)
   - No token details in error messages
   - Email validation before token generation

4. **API Security**
   - Token validation on every reset attempt
   - Expiration checks
   - Used token prevention
   - Password strength enforcement

## User Flow

### Forgot Password
1. User navigates to `/login` and clicks "Forgot Password?"
2. User enters email address
3. System validates email and generates reset token
4. Reset email sent with secure link: `/reset-password?token=xxxxx`
5. User clicks email link (valid for 1 hour)

### Reset Password
1. Frontend validates token automatically
2. User enters new password and confirmation
3. System validates token expiration and password strength
4. Password updated and token marked as used
5. User redirected to login (can't reuse same link)

## Database Changes

**New Table: password_resets**
```sql
CREATE TABLE password_resets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expiry_time TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
);
```

## Configuration Guide

### For Local Development (Console Logging)
- Leave `MAIL_USERNAME` and `MAIL_PASSWORD` empty
- Tokens will be logged to console
- Test using console token

### For Production (Gmail SMTP)
```bash
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD=your-app-password
```

### For Production (Custom SMTP)
Update `application.properties`:
```properties
spring.mail.host=your-smtp-server
spring.mail.port=587
spring.mail.username=your-username
spring.mail.password=your-password
```

## Testing

### Test Reset Flow
1. Register a test account
2. Navigate to forgot-password
3. Enter email address
4. Check console for token (dev) or email (prod)
5. Visit reset-password?token=xxxxx with token
6. Enter new password
7. Login with new password

### Test Token Validation
- Visit expired token: Should show "Token has expired"
- Visit used token: Should show "Token already used"
- Visit invalid token: Should show "Invalid token"

## Troubleshooting

### Emails Not Sending
1. Check `MAIL_USERNAME` and `MAIL_PASSWORD` environment variables
2. For Gmail: Use app-specific password (not regular password)
3. Check console logs for detailed error messages
4. Verify SMTP server credentials

### Token Validation Fails
1. Check database for `password_resets` table
2. Verify token hasn't expired (1 hour limit)
3. Check token hasn't been used already

### Password Reset Not Working
1. Verify user email exists in database
2. Check password meets minimum 6 character requirement
3. Ensure passwords match in confirmation field
4. Check browser console for error messages

## Files Modified/Created

### Backend
- ✅ `scheduling/entity/PasswordReset.java` - NEW
- ✅ `scheduling/repository/PasswordResetRepository.java` - NEW
- ✅ `scheduling/util/EmailService.java` - NEW
- ✅ `scheduling/util/TokenGenerator.java` - NEW
- ✅ `scheduling/controller/AuthController.java` - MODIFIED (added endpoints)
- ✅ `pom.xml` - MODIFIED (added mail dependency)
- ✅ `application.properties` - MODIFIED (added email config)

### Frontend
- ✅ `pages/auth/ForgotPasswordPage.js` - NEW
- ✅ `pages/auth/ResetPasswordPage.js` - NEW
- ✅ `pages/auth/LoginPage.js` - NEW
- ✅ `pages/auth/RegisterPage.js` - NEW
- ✅ `pages/auth/AuthPages.css` - NEW
- ✅ `pages/auth/PasswordResetPages.css` - NEW
- ✅ `services/authService.js` - MODIFIED (added methods)
- ✅ `App.js` - MODIFIED (added routes)

## Commit Information
- Commit Hash: `72d8f9c`
- Files Changed: 15
- Insertions: 1,229
- Deletions: 1
