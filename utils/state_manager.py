import threading

# Global state management for the application
image_states = []
lock = threading.Lock()

def get_image_states():
    """Get the current image states."""
    return image_states

def get_lock():
    """Get the threading lock."""
    return lock
