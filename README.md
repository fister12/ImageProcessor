# ImageProcessor
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
