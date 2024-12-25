import os
import zipfile
from PIL import Image
from io import BytesIO
from app import remove_background, resize_image, compress_image, change_image_format, crop_Image, rotate_Image, add_filter

def extract_images_from_zip(zip_file):
    """Extract images from a zip file."""
    images = []
    with zipfile.ZipFile(zip_file, 'r') as z:
        for filename in z.namelist():
            with z.open(filename) as f:
                img = Image.open(f)
                images.append((filename, img))
    return images

def process_images_remove_background(images):
    """Apply remove_background function to a list of images."""
    processed_images = []
    for filename, image in images:
        processed_image = remove_background(image)
        processed_images.append((filename, processed_image))
    return processed_images

def process_images_resize(images, width, height):
    """Apply resize_image function to a list of images."""
    processed_images = []
    for filename, image in images:
        processed_image = resize_image(image, width, height)
        processed_images.append((filename, processed_image))
    return processed_images

def process_images_compress(images, quality):
    """Apply compress_image function to a list of images."""
    processed_images = []
    for filename , image in images:
        processed_image = compress_image(image, quality)
        processed_images.append((filename, processed_image))
    return processed_images

def process_images_change_format(images, new_format):
    """Apply chnage_image_format function to a list of images."""
    processed_images = []
    for filename , image in images:
        processed_image = change_image_format(image, new_format)
        processed_images.append((filename, processed_image))
    return processed_images


def save_images_to_zip(images, output_zip_path):
    """Save a list of images to a zip file."""
    with zipfile.ZipFile(output_zip_path, 'w') as z:
        for filename, image in images:
            img_io = BytesIO()
            image_format = 'PNG' if filename.lower().endswith('.png') else 'JPEG'
            image.save(img_io, format=image_format)
            img_io.seek(0)
            z.writestr(filename, img_io.read())


def main(input_zip_path, output_zip_path, process_function, *args, **kwargs):
    # Extract images from zip
    images = extract_images_from_zip(input_zip_path)

    # Process images
    processed_images = process_function(images, *args, **kwargs)

    # Save processed images to zip
    save_images_to_zip(processed_images, output_zip_path)

if __name__ == "__main__":
    input_zip_path = 'input_images.zip'
    output_zip_path = 'processed_images.zip'

    # Example usage with remove_background function
    main(input_zip_path, output_zip_path, remove_background)