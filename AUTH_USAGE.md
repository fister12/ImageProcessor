# Authentication Routes Usage Guide

This document describes how to use the authentication routes in the ImageProcessor application.

## Setup

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. The database will be automatically created when you run the application for the first time.

3. Set a secure `SECRET_KEY` environment variable for production:
```bash
export SECRET_KEY='your-secret-key-here'
```

## API Endpoints

All authentication endpoints are prefixed with `/auth`.

### 1. Register a New User

**POST** `/auth/register`

Request body:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

Response (201):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### 2. Login

**POST** `/auth/login`

Request body:
```json
{
  "username": "johndoe",
  "password": "SecurePass123",
  "remember": false
}
```

Response (200):
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

Note: You can use either username or email in the `username` field.

### 3. Logout

**POST** `/auth/logout`

Requires authentication.

Response (200):
```json
{
  "message": "Logout successful"
}
```

### 4. Get Current User

**GET** `/auth/me`

Requires authentication.

Response (200):
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "created_at": "2024-01-01T00:00:00"
  }
}
```

### 5. Check Authentication Status

**GET** `/auth/check`

Does not require authentication.

Response (200):
```json
{
  "authenticated": true,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

Or if not authenticated:
```json
{
  "authenticated": false
}
```

### 6. Change Password

**POST** `/auth/change-password`

Requires authentication.

Request body:
```json
{
  "current_password": "SecurePass123",
  "new_password": "NewSecurePass456"
}
```

Response (200):
```json
{
  "message": "Password changed successfully"
}
```

### 7. Update Profile

**PUT** `/auth/update-profile`

Requires authentication.

Request body:
```json
{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

You can update either username, email, or both.

Response (200):
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "username": "newusername",
    "email": "newemail@example.com"
  }
}
```

## Error Responses

All endpoints return appropriate HTTP status codes:

- `400` - Bad Request (missing or invalid data)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (account deactivated)
- `409` - Conflict (username/email already exists)
- `500` - Internal Server Error

Error response format:
```json
{
  "error": "Error message here"
}
```

## Example Usage with curl

### Register
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","email":"john@example.com","password":"SecurePass123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","password":"SecurePass123"}' \
  -c cookies.txt
```

### Get Current User (with session cookie)
```bash
curl -X GET http://localhost:5000/auth/me \
  -b cookies.txt
```

## Frontend Integration

When using these endpoints from a frontend application:

1. **Login/Register**: Send POST requests with JSON data
2. **Session Management**: Flask-Login handles sessions automatically via cookies
3. **Protected Routes**: Use the `/auth/check` endpoint to verify authentication status
4. **Logout**: Call `/auth/logout` to clear the session

## Security Notes

- Passwords are hashed using Werkzeug's secure password hashing
- Sessions are managed by Flask-Login
- Set a strong `SECRET_KEY` in production
- Consider using HTTPS in production
- The database file (`imageprocessor.db`) should be kept secure




