# Mobile Database - Authentication API

A complete authentication system with JWT tokens, OTP verification, and password management for mobile applications.

## 🚀 Features

- ✅ User Registration with Email
- ✅ Email Verification with OTP
- ✅ User Login with JWT Tokens
- ✅ Change Password (with current password)
- ✅ Forgot Password (email reset link)
- ✅ Reset Password (with token)
- ✅ User Profile Management
- ✅ Protected Routes with JWT Authentication

## 📦 Installation

1. **Install Dependencies** (run in Command Prompt or enable PowerShell scripts):
```bash
npm install express mongoose cors bcryptjs jsonwebtoken nodemailer dotenv
npm install -D @types/bcryptjs @types/nodemailer
```

2. **Configure Environment Variables**:
Update the `.env` file with your email credentials:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=noreply@yourdomain.com
```

For Gmail, you need to create an App Password:
- Go to Google Account Settings
- Security → 2-Step Verification → App passwords
- Generate a new app password and use it in `EMAIL_PASSWORD`

## 🔧 API Endpoints

### Public Endpoints (No Authentication Required)

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email with OTP.",
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "John Doe",
      "isVerified": false
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    },
    "otpSent": true
  }
}
```

#### 2. Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### 3. Resend OTP
```http
POST /api/auth/resend-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### 4. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "John Doe",
      "isVerified": true
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

#### 5. Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### 6. Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "newpassword123"
}
```

### Protected Endpoints (Require Authentication)

Add the JWT token in the Authorization header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### 7. Change Password
```http
POST /api/auth/change-password
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

#### 8. Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### 9. Update User Profile
```http
PUT /api/auth/profile
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "+9876543210"
}
```

## 🏃 Running the Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📱 Mobile App Integration

### 1. Register Flow
```javascript
// Register user
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe'
  })
});

const data = await response.json();
// Store tokens: data.tokens.accessToken, data.tokens.refreshToken
```

### 2. Verify OTP
```javascript
const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    otp: '123456'
  })
});
```

### 3. Login Flow
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
// Store tokens securely
```

### 4. Making Authenticated Requests
```javascript
const response = await fetch('http://localhost:5000/api/auth/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

### 5. Change Password
```javascript
const response = await fetch('http://localhost:5000/api/auth/change-password', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    currentPassword: 'oldpassword',
    newPassword: 'newpassword'
  })
});
```

### 6. Forgot Password Flow
```javascript
// Step 1: Request reset link
const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
});

// Step 2: User receives email with token and enters new password
const resetResponse = await fetch('http://localhost:5000/api/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'token-from-email',
    newPassword: 'newpassword123'
  })
});
```

## 🔒 Security Features

- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens for authentication
- OTP expires in 10 minutes
- Reset tokens expire in 1 hour
- Email verification required for new users
- Current password required to change password

## 📝 File Structure

```
mobile-database/
├── src/
│   ├── config/          # Database and app configuration
│   ├── controllers/
│   │   └── authController.ts  # All authentication logic
│   ├── middlewares/
│   │   └── auth.ts      # JWT verification middleware
│   ├── models/
│   │   └── User.ts      # User database schema
│   ├── routes/
│   │   └── authRoutes.ts  # API routes
│   └── utils/
│       ├── email.ts     # Email sending utilities
│       ├── jwt.ts       # JWT token generation
│       └── otp.ts       # OTP generation utilities
├── app.ts              # Express app setup
├── index.ts            # Server entry point
├── .env                # Environment variables
├── package.json
└── tsconfig.json
```

## 🛠️ Troubleshooting

### PowerShell Script Execution Error
If you get an execution policy error, use Command Prompt or run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Email Not Sending
- Check Gmail App Password is correct
- Ensure 2-Step Verification is enabled
- Check EMAIL_HOST and EMAIL_PORT in .env

### MongoDB Connection Issues
- Verify MONGO_URL in .env
- Check network connectivity
- Ensure IP whitelist in MongoDB Atlas

## 📧 Email Templates

The system includes three email templates:
1. **OTP Verification** - Sent during registration
2. **Password Reset** - Sent when user forgets password
3. **Welcome Email** - Sent after successful verification

## 🎯 Next Steps

- Implement refresh token rotation
- Add rate limiting for security
- Add social login (Google, Facebook)
- Implement two-factor authentication (2FA)
- Add user roles and permissions

## 📄 License

ISC
# mobile-database-server
