# Password Management & Admin User Creation Fix

## Problem
- Users added by admin with temporary password couldn't login
- Password verification failed because passwords weren't being BCrypt hashed
- Login error: "Password verification failed for: rushi@gmail.com"

## Solution
Three new admin endpoints have been added to properly handle user creation and password management with BCrypt hashing.

---

## New Admin Endpoints

### 1. Create User with Temporary Password
**Endpoint:** `POST /api/admin/users/create-with-temp-password`

**Purpose:** Admin creates a new user with a temporary password. The password is automatically BCrypt hashed before storage.

**Request Body:**
```json
{
  "name": "Rushi Trainer",
  "email": "rushi@gmail.com",
  "temporaryPassword": "123456",
  "role": "TRAINER"
}
```

**Valid Roles:** `STUDENT`, `TRAINER`, `ADMIN`

**Response:**
```json
{
  "message": "User created successfully",
  "id": 15,
  "name": "Rushi Trainer",
  "email": "rushi@gmail.com",
  "role": "TRAINER",
  "temporaryPassword": "123456",
  "note": "User can now login with their email and temporary password. They should change it on first login."
}
```

**How it Works:**
1. Admin calls this endpoint with user details and temporary password
2. System validates all inputs
3. Password is BCrypt hashed using Spring Security's BCryptPasswordEncoder
4. User is saved to database with hashed password
5. User can immediately login with email and temporary password

---

### 2. Reset User Password
**Endpoint:** `POST /api/admin/users/reset-temp-password`

**Purpose:** Admin resets a user's password to a new temporary password (e.g., forgotten passwords).

**Request Body:**
```json
{
  "email": "rushi@gmail.com",
  "newTemporaryPassword": "NewPass123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully",
  "email": "rushi@gmail.com",
  "newPassword": "NewPass123",
  "note": "User can now login with their email and new temporary password"
}
```

---

### 3. Get Password Hash (Manual DB Updates)
**Endpoint:** `POST /api/admin/users/get-password-hash`

**Purpose:** Get the BCrypt hash of a password for manual database updates.

**Request Body:**
```json
{
  "password": "123456"
}
```

**Response:**
```json
{
  "password": "123456",
  "hash": "$2a$10$...",
  "sqlUpdate": "UPDATE users SET password = '$2a$10$...' WHERE email = '?';"
}
```

---

## Fix for Existing User (rushi@gmail.com)

### Option 1: Use SQL Script (Direct Database Update)
1. Run the SQL script: `fix_rushi_password.sql`
2. This updates rushi@gmail.com with the correct BCrypt hash for "123456"
3. User can then login immediately

### Option 2: Use the Reset Endpoint
1. Call: `POST /api/admin/users/reset-temp-password`
2. Body:
```json
{
  "email": "rushi@gmail.com",
  "newTemporaryPassword": "123456"
}
```
3. User can then login with email and "123456"

### Option 3: Get Hash and Update Manually
1. Call: `POST /api/admin/users/get-password-hash`
2. Body: `{"password": "123456"}`
3. Copy the returned hash
4. Execute SQL: `UPDATE users SET password = '<hash>' WHERE email = 'rushi@gmail.com';`

---

## How It Works (Technical Details)

### Password Flow
```
Clear Password "123456"
         ↓
[BCryptPasswordEncoder]
         ↓
Hashed: $2a$10$...
         ↓
[Store in Database]
         ↓
[Login Process]
         ↓
User enters "123456"
         ↓
[BCryptPasswordEncoder.matches()]
         ↓
Verify against stored hash
         ↓
✅ Authenticated
```

### Key Classes
- **PasswordUtil.java** - Handles BCrypt hashing and verification
- **AdminUserManagementController.java** - Admin endpoints for user management
- **AuthController.java** - Login and authentication endpoints

---

## Testing

### Test 1: Create User and Login
```bash
# 1. Create user
POST /api/admin/users/create-with-temp-password
{
  "name": "Test User",
  "email": "test@example.com",
  "temporaryPassword": "Test123",
  "role": "STUDENT"
}

# 2. Login with that password
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "Test123"
}

# Response should include: token, id, name, email, role
```

### Test 2: Reset Password
```bash
# Reset password
POST /api/admin/users/reset-temp-password
{
  "email": "test@example.com",
  "newTemporaryPassword": "NewTest456"
}

# Login with new password
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "NewTest456"
}
```

---

## Backend Changes Over Time

### Before (Bug)
- Admin creates user through `/api/users` endpoint
- Password might not be hashed if using wrong endpoint
- User can't login because password verification fails

### After (Fixed)
- Admin uses `/api/admin/users/create-with-temp-password`
- Password is guaranteed to be BCrypt hashed
- User can login immediately
- Additional endpoints for password reset and manual fixes

---

## Migration Steps

If you have existing users with plain-text or incorrectly hashed passwords:

1. **Identify affected users:**
   ```sql
   SELECT id, email, password FROM users WHERE PASSWORD NOT LIKE '$2a$%';
   ```

2. **Use one of these options:**
   - Option A: Admin interface - Use `/api/admin/users/reset-temp-password` for each user
   - Option B: Script - Bulk update using SQL script with proper hashes
   - Option C: Manual - Use `/api/admin/users/get-password-hash` to generate hashes

3. **Verify:** Try logging in with the user account

---

## Security Notes

- Passwords are hashed with BCrypt (10 rounds) before storage
- Never store or transmit plain-text passwords
- Use HTTPS in production
- Admin endpoints should be protected by authentication middleware
- Temporary passwords should be changed on first login (future feature)

---

## Troubleshooting

### "Password verification failed for: email@example.com"
**Cause:** Password not BCrypt hashed in database
**Fix:** Use `/api/admin/users/reset-temp-password` endpoint or run SQL script

### "Email already exists"
**Cause:** User with this email already in database
**Fix:** Use `/api/admin/users/reset-temp-password` if you want to change password, or delete and recreate user

### "Invalid role"
**Cause:** Role is not one of: STUDENT, TRAINER, ADMIN
**Fix:** Use correct role value

---

## API Examples Using cURL

### Create User
```bash
curl -X POST http://localhost:8080/api/admin/users/create-with-temp-password \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rushi Trainer",
    "email": "rushi@gmail.com",
    "temporaryPassword": "123456",
    "role": "TRAINER"
  }'
```

### Reset Password
```bash
curl -X POST http://localhost:8080/api/admin/users/reset-temp-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rushi@gmail.com",
    "newTemporaryPassword": "123456"
  }'
```

### Get Hash
```bash
curl -X POST http://localhost:8080/api/admin/users/get-password-hash \
  -H "Content-Type: application/json" \
  -d '{
    "password": "123456"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rushi@gmail.com",
    "password": "123456"
  }'
```

---

## Files Modified/Created

- **AdminUserManagementController.java** - NEW: Admin user management endpoints
- **AuthController.java** - UPDATED: Added hash-password endpoint
- **PasswordUtil.java** - EXISTS: Handles BCrypt operations (no changes needed)
- **fix_rushi_password.sql** - NEW: SQL script to fix rushi@gmail.com
- **PASSWORD_MANAGEMENT_FIX.md** - NEW: This documentation

---

## Next Steps

1. Recompile and redeploy backend
2. Use one of the fix options for rushi@gmail.com
3. Test login with rushi@gmail.com / 123456
4. Use new endpoints for creating future users
5. Consider adding password change functionality for users on first login
