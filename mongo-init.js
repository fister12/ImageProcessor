// MongoDB initialization script
db = db.getSiblingDB('imageprocessor');

// Create users collection
db.createCollection('users');

// Create indexes for better performance
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });

// Create image_history collection for storing image processing history
db.createCollection('image_history');
db.image_history.createIndex({ "user_id": 1 });
db.image_history.createIndex({ "created_at": 1 });

// Create user preferences collection
db.createCollection('user_preferences');
db.user_preferences.createIndex({ "user_id": 1 }, { unique: true });

print('Database initialized successfully!');
