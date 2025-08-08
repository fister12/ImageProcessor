# ImageProcessor

A comprehensive image processing application with AI-powered background removal, modern React frontend, and various image manipulation tools.

## 🚀 Features

### Frontend (React)
- **Modern React 18** application with hooks and functional components
- **JWT Authentication** with protected routes
- **Drag-and-drop** image upload with real-time preview
- **Comprehensive processing options**:
  - AI Background removal
  - Resize with custom dimensions
  - Compression with quality control
  - Format conversion (JPEG, PNG, WebP, BMP)
  - Rotation and cropping
  - Advanced filters and effects
  - Image property adjustments
- **Batch processing** for multiple images
- **User dashboard** with statistics and history
- **Responsive design** with Tailwind CSS
- **Real-time notifications** and loading states

### Backend (Flask)
- **RESTful API** with comprehensive endpoints
- **MongoDB** database for user management and history
- **JWT authentication** with secure token management
- **Image processing** with PIL and OpenCV
- **Batch processing** support for ZIP files
- **Docker** containerization for easy deployment

## 🏗️ Project Structure

```
ImageProcessor/
├── frontned/                 # React Frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # Authentication context
│   │   ├── pages/           # Page components
│   │   └── App.js           # Main app component
│   ├── package.json         # Frontend dependencies
│   └── tailwind.config.js   # Tailwind configuration
├── routes/                  # Flask API routes
├── utils/                   # Backend utilities
├── app.py                   # Main Flask application
├── docker-compose.yml       # Docker orchestration
└── requirements.txt         # Python dependencies
```

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ImageProcessor
   ```

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB Express: http://localhost:8081

### Manual Setup

#### Backend Setup
1. **Create Python virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # or
   venv\Scripts\activate     # Windows
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start MongoDB** (ensure MongoDB is running on port 27017)

4. **Run the Flask backend:**
   ```bash
   python app.py
   ```

#### Frontend Setup
1. **Navigate to frontend directory:**
   ```bash
   cd frontned
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start the React development server:**
   ```bash
   npm start
   ```

## 📖 Documentation

For detailed information about the frontend integration, see [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md).

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend
SECRET_KEY=your-super-secret-key-change-in-production
JWT_SECRET_KEY=jwt-secret-string-change-in-production
MONGODB_URI=mongodb://admin:password123@localhost:27017/imageprocessor?authSource=admin

# Frontend
REACT_APP_API_URL=http://localhost:5000
```

## 🎯 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `PUT /auth/update-preferences` - Update preferences

### Image Processing
- `POST /` - Single image processing
- `POST /batch` - Batch image processing
- `GET /auth/image-history` - Processing history

### Health Check
- `GET /health` - API health status

## 🛠️ Development

### Backend Development
```bash
# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run with auto-reload
python app.py
```

### Frontend Development
```bash
cd frontned

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### Tailwind CSS Development
```bash
cd frontned

# Watch for changes
npx tailwindcss -i ./src/index.css -o ./src/output.css --watch
```

## 🐳 Docker Commands

### Build and Run
```bash
# Build all services
docker-compose build

# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down
```

### Individual Services
```bash
# Build backend only
docker build -t image-processor:latest .

# Run backend only
docker run -p 5000:5000 image-processor:latest

# Build frontend only
cd frontned
docker build -t image-processor-frontend:latest .
```

## 📊 Features Overview

### Image Processing Capabilities
- **Background Removal**: AI-powered automatic background removal
- **Resize**: Custom width and height with aspect ratio preservation
- **Compression**: Quality-based compression for web optimization
- **Format Conversion**: Convert between JPEG, PNG, WebP, BMP
- **Rotation**: Custom angle rotation
- **Cropping**: Precise image cropping
- **Filters**: Apply blur, sharpen, edge enhance, emboss effects
- **Adjustments**: Brightness, contrast, and saturation control
- **Enhancement**: Automatic image enhancement

### User Management
- **Registration**: Secure user account creation
- **Authentication**: JWT-based secure authentication
- **Profile Management**: User preferences and settings
- **History Tracking**: Complete processing history
- **Batch Processing**: Handle multiple images efficiently

### User Interface
- **Responsive Design**: Works on all device sizes
- **Modern UI**: Clean, intuitive interface
- **Real-time Preview**: See changes before processing
- **Drag & Drop**: Easy file upload
- **Progress Indicators**: Visual feedback for operations
- **Toast Notifications**: User-friendly feedback

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Comprehensive form validation
- **File Upload Security**: Secure file handling

## 🚀 Performance Optimizations

- **Image Optimization**: Efficient processing algorithms
- **Batch Processing**: Parallel image processing
- **Caching**: Optimized database queries
- **Lazy Loading**: Efficient frontend loading
- **Bundle Optimization**: Minimized JavaScript bundles

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in `FRONTEND_INTEGRATION.md`
- Review the API endpoints documentation

---

## Setting Up the Project

This guide will walk you through setting up a Python virtual environment, installing dependencies, and configuring Tailwind CSS for your project.

---

### Table of Contents

1. [Setting Up Python Virtual Environment](#1-setting-up-python-virtual-environment)
   - [Windows](#windows)
   - [Linux (Including Garuda Linux)](#linux-including-garuda-linux)
2. [Installing Python Dependencies](#2-installing-python-dependencies)
3. [Installing and Configuring Tailwind CSS](#3-installing-and-configuring-tailwind-css)
4. [Running Tailwind CSS in Watch Mode](#4-running-tailwind-css-in-watch-mode)
5. [Final Steps](#5-final-steps)

---

### 1. Setting Up Python Virtual Environment

#### **Windows**

1. Open **Command Prompt** or **PowerShell** and navigate to your project directory:
   ```sh
   cd path\to\your\project
   ```
2. Create and activate the virtual environment:
   ```sh
   python -m venv venv
   venv\Scripts\activate   # Command Prompt
   .\venv\Scripts\Activate.ps1   # PowerShell
   ```

#### **Linux (Including Garuda Linux)**

1. Open **Terminal** and navigate to your project directory:
   ```sh
   cd path/to/your/project
   ```
2. Create and activate the virtual environment:
   ```sh
   python3 -m venv venv
   source venv/bin/activate    # bash/zsh
   source venv/bin/activate.fish    # fish shell
   ```

---

### 2. Installing Python Dependencies

After activating the virtual environment, install the required Python dependencies:
```sh
pip install -r requirements.txt
```

---

### 3. Installing and Configuring Tailwind CSS

1. Initialize npm and install Tailwind dependencies:
   ```sh
   npm init -y
   npm install -D tailwindcss postcss autoprefixer
   ```
2. Generate `tailwind.config.js`:
   ```sh
   npx tailwindcss init
   ```
3. Create a directory structure for your static assets:
   ```
   project/
   └── static/
       └── css/
           ├── input.css
           └── output.css
   ```
4. In `input.css`, add the Tailwind imports:
   ```css
   /* ./static/css/input.css */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

---

### 4. Running Tailwind CSS in Watch Mode

To compile and watch Tailwind CSS for changes, run:
```sh
npx tailwindcss -i ./static/css/input.css -o ./static/css/output.css --watch
```

This command processes `input.css` and generates the compiled `output.css`, watching for any changes.

---

### 5. Final Steps

- Ensure the virtual environment is activated and dependencies are installed.
- Run `npx tailwindcss` to start the Tailwind watch process.
- Develop with the assurance that your Python environment and Tailwind CSS setup are correctly configured.

### Docker setup
setup the  docker environment on your machine by installing docker desktop and docker CLI then
Run the command:
```sh
docker build -t image-processor:latest .
```
this command will build the docker image

run:
```sh
docker run -p 5000:5000 image-processor:latest
```
this command will run the docker image on your machine
