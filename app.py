from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
from datetime import timedelta
from routes.ImageProcess import image_process_bp
from routes.BatchProcessing import batch_process_bp
from routes.Auth import auth_bp

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-super-secret-key-change-in-production')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Initialize extensions
cors = CORS(app, origins=['http://localhost:3000', 'http://frontend:3000'])  # Allow frontend origin
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(image_process_bp)
app.register_blueprint(batch_process_bp)
app.register_blueprint(auth_bp, url_prefix='/auth')

@app.route('/health')
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "Image Processor API is running"}, 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)