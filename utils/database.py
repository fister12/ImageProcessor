import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import logging

class DatabaseManager:
    _instance = None
    _client = None
    _db = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseManager, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if self._client is None:
            self.connect()

    def connect(self):
        """Connect to MongoDB database."""
        try:
            # Get MongoDB URI from environment variable
            mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://admin:password123@localhost:27017/imageprocessor?authSource=admin')
            
            self._client = MongoClient(mongodb_uri)
            
            # Test the connection
            self._client.admin.command('ping')
            
            # Get the database
            self._db = self._client.get_database('imageprocessor')
            
            logging.info("Connected to MongoDB successfully")
            
        except ConnectionFailure as e:
            logging.error(f"Failed to connect to MongoDB: {e}")
            raise

    def get_database(self):
        """Get the database instance."""
        if self._db is None:
            self.connect()
        return self._db

    def get_collection(self, collection_name):
        """Get a specific collection."""
        return self.get_database()[collection_name]

    def close_connection(self):
        """Close the database connection."""
        if self._client:
            self._client.close()
            self._client = None
            self._db = None

# Initialize database manager
db_manager = DatabaseManager()
