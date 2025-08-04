from flask import Blueprint, request, jsonify, session
import bcrypt
import secrets
from datetime import datetime, timedelta
from bson.objectid import ObjectId
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from utils.database import db_manager

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not username or not email or not password:
            return jsonify({"error": "Username, email, and password are required"}), 400
        
        users_collection = db_manager.get_collection('users')
        
        # Check if user already exists
        if users_collection.find_one({"$or": [{"username": username}, {"email": email}]}):
            return jsonify({"error": "Username or email already exists"}), 400
        
        # Hash the password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Create user document
        user_doc = {
            "username": username,
            "email": email,
            "password_hash": password_hash,
            "created_at": datetime.utcnow(),
            "is_active": True,
            "preferences": {
                "default_quality": 75,
                "default_format": "JPEG"
            }
        }
        
        # Insert user into database
        result = users_collection.insert_one(user_doc)
        
        # Create access token
        access_token = create_access_token(identity=str(result.inserted_id))
        
        return jsonify({
            "message": "User registered successfully",
            "access_token": access_token,
            "user": {
                "id": str(result.inserted_id),
                "username": username,
                "email": email
            }
        }), 201
        
    except Exception as e:
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login a user."""
    try:
        data = request.get_json()
        username_or_email = data.get('username')
        password = data.get('password')
        
        if not username_or_email or not password:
            return jsonify({"error": "Username/email and password are required"}), 400
        
        users_collection = db_manager.get_collection('users')
        
        # Find user by username or email
        user = users_collection.find_one({
            "$or": [
                {"username": username_or_email},
                {"email": username_or_email}
            ]
        })
        
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401
        
        # Check password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash']):
            return jsonify({"error": "Invalid credentials"}), 401
        
        # Create access token
        access_token = create_access_token(identity=str(user['_id']))
        
        # Update last login
        users_collection.update_one(
            {"_id": user['_id']},
            {"$set": {"last_login": datetime.utcnow()}}
        )
        
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": {
                "id": str(user['_id']),
                "username": user['username'],
                "email": user['email']
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Login failed: {str(e)}"}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    """Get user profile."""
    try:
        user_id = get_jwt_identity()
        users_collection = db_manager.get_collection('users')
        
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "user": {
                "id": str(user['_id']),
                "username": user['username'],
                "email": user['email'],
                "created_at": user['created_at'].isoformat(),
                "preferences": user.get('preferences', {})
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to get profile: {str(e)}"}), 500

@auth_bp.route('/update-preferences', methods=['PUT'])
@jwt_required()
def update_preferences():
    """Update user preferences."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        users_collection = db_manager.get_collection('users')
        
        # Update preferences
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"preferences": data.get('preferences', {})}}
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "User not found or no changes made"}), 404
        
        return jsonify({"message": "Preferences updated successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to update preferences: {str(e)}"}), 500

@auth_bp.route('/image-history', methods=['GET'])
@jwt_required()
def get_image_history():
    """Get user's image processing history."""
    try:
        user_id = get_jwt_identity()
        history_collection = db_manager.get_collection('image_history')
        
        # Get pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        skip = (page - 1) * limit
        
        # Get history records
        history = list(history_collection.find(
            {"user_id": ObjectId(user_id)}
        ).sort("created_at", -1).skip(skip).limit(limit))
        
        # Convert ObjectId to string for JSON serialization
        for record in history:
            record['_id'] = str(record['_id'])
            record['user_id'] = str(record['user_id'])
            record['created_at'] = record['created_at'].isoformat()
        
        # Get total count
        total = history_collection.count_documents({"user_id": ObjectId(user_id)})
        
        return jsonify({
            "history": history,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to get history: {str(e)}"}), 500
