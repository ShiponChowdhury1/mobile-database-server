# Zod Validation Examples

## Installation
```bash
npm install zod
```

## Validation Error Response Format

When validation fails, you'll get:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

## Register Validation
```javascript
// Valid request
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",           // Optional, min 2 chars
  "phone": "+1234567890"        // Optional, valid format
}

// Invalid examples
{
  "email": "invalid-email",     // ❌ Invalid email format
  "password": "12345"           // ❌ Password must be at least 6 characters
}
```

## Login Validation
```javascript
// Valid request
{
  "email": "user@example.com",
  "password": "password123"
}

// Invalid examples
{
  "email": "not-an-email",      // ❌ Invalid email format
  "password": ""                // ❌ Password is required
}
```

## Verify OTP Validation
```javascript
// Valid request
{
  "email": "user@example.com",
  "otp": "123456"               // Must be exactly 6 digits
}

// Invalid examples
{
  "email": "user@example.com",
  "otp": "12345"                // ❌ OTP must be 6 digits
}

{
  "email": "user@example.com",
  "otp": "12345a"               // ❌ OTP must contain only numbers
}
```

## Change Password Validation
```javascript
// Valid request
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"   // Min 6 characters
}

// Invalid examples
{
  "currentPassword": "oldpass123",
  "newPassword": "12345"        // ❌ New password must be at least 6 characters
}
```

## Forgot Password Validation
```javascript
// Valid request
{
  "email": "user@example.com"
}

// Invalid examples
{
  "email": ""                   // ❌ Email is required
}
```

## Reset Password Validation
```javascript
// Valid request
{
  "token": "reset-token-string",
  "newPassword": "newpass123"   // Min 6 characters
}

// Invalid examples
{
  "token": "",                  // ❌ Reset token is required
  "newPassword": "12345"        // ❌ New password must be at least 6 characters
}
```

## Update Profile Validation
```javascript
// Valid request (both fields optional)
{
  "name": "John Updated",       // Optional, min 2 chars
  "phone": "+9876543210"        // Optional, valid format
}

// Invalid examples
{
  "name": "J",                  // ❌ Name must be at least 2 characters
  "phone": "invalid"            // ❌ Invalid phone number
}
```

## Phone Number Format
Valid formats:
- `+1234567890`
- `123-456-7890`
- `(123) 456-7890`
- `123.456.7890`
- `+1 (123) 456-7890`

## Testing with cURL

```bash
# Valid registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'

# Invalid email (will get validation error)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "password123"
  }'
```

## Mobile App Integration

```javascript
// React Native / JavaScript example
const register = async () => {
  try {
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

    if (!data.success && data.errors) {
      // Handle validation errors
      data.errors.forEach(error => {
        console.log(`${error.field}: ${error.message}`);
      });
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
};
```

## Benefits of Zod Validation

✅ **Type Safety** - TypeScript types automatically inferred
✅ **Detailed Errors** - Field-specific error messages
✅ **Consistent Format** - All validation errors in same structure
✅ **Less Code** - No manual validation in controllers
✅ **Better UX** - Clear error messages for mobile apps
