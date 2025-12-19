# Image Processor Frontend

React-based frontend application for user authentication and login.

## Features

- User registration with password validation
- User login with remember me option
- Protected dashboard route
- Session management with Flask-Login
- Modern UI with DaisyUI/TailwindCSS

## Development

### Prerequisites

- Node.js 18+ and npm

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## Docker

The frontend is containerized using Docker with a multi-stage build:

1. Build stage: Uses Node.js to build the React app
2. Production stage: Uses Nginx to serve the static files

### Running with Docker Compose

The frontend service is configured in `docker-compose.yml`. To start:

```bash
docker-compose up --build
```

The frontend will be available at `http://localhost:3000`

## API Integration

The frontend communicates with the Flask backend through:

- `/auth/login` - User login
- `/auth/register` - User registration
- `/auth/logout` - User logout
- `/auth/check` - Check authentication status
- `/auth/me` - Get current user info

Nginx is configured to proxy `/auth/*` requests to the backend service.

## Environment Variables

You can set `VITE_API_BASE_URL` to override the default API base URL (defaults to relative URLs which are proxied by nginx).

