# BatchProcessing.py - Legacy compatibility module
# This module provides backward compatibility with the old batch processing functions

import os
import zipfile
from PIL import Image
from io import BytesIO
import asyncio
from utils.image_processing import (
    remove_background, resize_image, compress_image, change_image_format
)

def extract_images_from_zip(zip_file):
    """Extract images from a zip file."""
    images = []
    with zipfile.ZipFile(zip_file, 'r') as z:
        for filename in z.namelist():
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp')):
                try:
                    with z.open(filename) as f:
                        img = Image.open(BytesIO(f.read()))
                        images.append((filename, img))
                except Exception as e:
                    print(f"Error processing {filename}: {e}")
                    continue
    return images

def process_images_remove_background(images):
    """Apply remove_background function to a list of images."""
    async def async_process():
        processed_images = []
        for filename, image in images:
            try:
                processed_image = await remove_background(image)
                processed_images.append((filename, processed_image))
            except Exception as e:
                print(f"Error removing background from {filename}: {e}")
                processed_images.append((filename, image))
        return processed_images
    
    return asyncio.run(async_process())

def process_images_resize(images, width, height):
    """Apply resize_image function to a list of images."""
    async def async_process():
        processed_images = []
        for filename, image in images:
            try:
                processed_image = await resize_image(image, width, height)
                processed_images.append((filename, processed_image))
            except Exception as e:
                print(f"Error resizing {filename}: {e}")
                processed_images.append((filename, image))
        return processed_images
    
    return asyncio.run(async_process())

def process_images_compress(images, quality):
    """Apply compress_image function to a list of images."""
    async def async_process():
        processed_images = []
        for filename, image in images:
            try:
                processed_image = await compress_image(image, quality)
                processed_images.append((filename, processed_image))
            except Exception as e:
                print(f"Error compressing {filename}: {e}")
                processed_images.append((filename, image))
        return processed_images
    
    return asyncio.run(async_process())

def process_images_change_format(images, new_format):
    """Apply change_image_format function to a list of images."""
    async def async_process():
        processed_images = []
        for filename, image in images:
            try:
                processed_image = await change_image_format(image, new_format)
                name_without_ext = os.path.splitext(filename)[0]
                new_filename = f"{name_without_ext}.{new_format.lower()}"
                processed_images.append((new_filename, processed_image))
            except Exception as e:
                print(f"Error changing format of {filename}: {e}")
                processed_images.append((filename, image))
        return processed_images
    
    return asyncio.run(async_process())

def save_images_to_zip(images, output_zip_path):
    """Save a list of images to a zip file."""
    with zipfile.ZipFile(output_zip_path, 'w') as z:
        for filename, image in images:
            try:
                img_io = BytesIO()
                if filename.lower().endswith('.png'):
                    image_format = 'PNG'
                elif filename.lower().endswith('.webp'):
                    image_format = 'WEBP'
                elif filename.lower().endswith('.bmp'):
                    image_format = 'BMP'
                else:
                    image_format = 'JPEG'
                    if image.mode == 'RGBA':
                        image = image.convert('RGB')
                
                image.save(img_io, format=image_format)
                img_io.seek(0)
                z.writestr(filename, img_io.read())
            except Exception as e:
                print(f"Error saving {filename} to zip: {e}")
