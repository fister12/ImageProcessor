import os
import zipfile
from PIL import Image
from io import BytesIO
from flask import Blueprint, request, send_file
from utils.image_processing import (
    remove_background, resize_image, compress_image, change_image_format
)

batch_process_bp = Blueprint('batch_process', __name__)

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

async def process_images_remove_background(images):
    """Apply remove_background function to a list of images."""
    processed_images = []
    for filename, image in images:
        try:
            processed_image = await remove_background(image)
            processed_images.append((filename, processed_image))
        except Exception as e:
            print(f"Error removing background from {filename}: {e}")
            processed_images.append((filename, image))  # Keep original if processing fails
    return processed_images

async def process_images_resize(images, width, height):
    """Apply resize_image function to a list of images."""
    processed_images = []
    for filename, image in images:
        try:
            processed_image = await resize_image(image, width, height)
            processed_images.append((filename, processed_image))
        except Exception as e:
            print(f"Error resizing {filename}: {e}")
            processed_images.append((filename, image))
    return processed_images

async def process_images_compress(images, quality):
    """Apply compress_image function to a list of images."""
    processed_images = []
    for filename, image in images:
        try:
            processed_image = await compress_image(image, quality)
            processed_images.append((filename, processed_image))
        except Exception as e:
            print(f"Error compressing {filename}: {e}")
            processed_images.append((filename, image))
    return processed_images

async def process_images_change_format(images, new_format):
    """Apply change_image_format function to a list of images."""
    processed_images = []
    for filename, image in images:
        try:
            processed_image = await change_image_format(image, new_format)
            # Update filename extension to match new format
            name_without_ext = os.path.splitext(filename)[0]
            new_filename = f"{name_without_ext}.{new_format.lower()}"
            processed_images.append((new_filename, processed_image))
        except Exception as e:
            print(f"Error changing format of {filename}: {e}")
            processed_images.append((filename, image))
    return processed_images

def save_images_to_zip(images, output_zip_path):
    """Save a list of images to a zip file."""
    with zipfile.ZipFile(output_zip_path, 'w') as z:
        for filename, image in images:
            try:
                img_io = BytesIO()
                # Determine format based on filename extension
                if filename.lower().endswith('.png'):
                    image_format = 'PNG'
                elif filename.lower().endswith('.webp'):
                    image_format = 'WEBP'
                elif filename.lower().endswith('.bmp'):
                    image_format = 'BMP'
                else:
                    image_format = 'JPEG'
                    # Convert RGBA to RGB for JPEG
                    if image.mode == 'RGBA':
                        image = image.convert('RGB')
                
                image.save(img_io, format=image_format)
                img_io.seek(0)
                z.writestr(filename, img_io.read())
            except Exception as e:
                print(f"Error saving {filename} to zip: {e}")

@batch_process_bp.route('/batch', methods=['POST'])
async def batch_processing():
    """Handle batch processing of images from ZIP file."""
    if request.method == 'POST':
        if 'zip_file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        zip_file = request.files['zip_file']
        if zip_file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        try:
            # Extract images from ZIP
            input_images = extract_images_from_zip(zip_file)
            
            if not input_images:
                return jsonify({"error": "No valid images found in ZIP file"}), 400
            
            # Apply processing operations
            if request.form.get('remove_bg'):
                input_images = await process_images_remove_background(input_images)
            if request.form.get('resize'):
                width = int(request.form.get('width', 800))
                height = int(request.form.get('height', 600))
                input_images = await process_images_resize(input_images, width, height)
            if request.form.get('compress'):
                quality = int(request.form.get('quality', 75))
                input_images = await process_images_compress(input_images, quality)
            if request.form.get('change_format'):
                new_format = request.form.get('format', 'JPEG').upper()
                input_images = await process_images_change_format(input_images, new_format)
            
            # Save processed images to ZIP
            output_zip_path = 'processed_images.zip'
            save_images_to_zip(input_images, output_zip_path)
            
            return send_file(output_zip_path, as_attachment=True, download_name='processed_images.zip')
            
        except Exception as e:
            return jsonify({"error": f"Error processing batch: {str(e)}"}), 500


