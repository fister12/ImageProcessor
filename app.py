from flask import Flask, render_template, request, send_file
from rembg import remove
from PIL import Image, ImageFilter , ImageEnhance
from io import BytesIO
import threading
import requests
import cv2
import numpy as np

app = Flask(__name__)
image_states = []
lock = threading.Lock()

def remove_background(input_image):
    """Remove background from the input image."""
    return remove(input_image)

def resize_image(input_image, width, height):
    """Resize the input image to the specified dimensions."""
    return input_image.resize((width, height))

def compress_image(input_image, quality):
    """Compress the input image to the specified quality."""
    img_io = BytesIO()
    input_image.save(img_io, format="JPEG", quality=quality)
    img_io.seek(0)
    return img_io

def change_image_format(input_image, new_format):
    """Convert the input image to a different format."""
    img_io = BytesIO()
    input_image.save(img_io, format=new_format)
    img_io.seek(0)
    return img_io

def crop_Image(input_image , top , bottom , left , right):
    """Crop the input image."""
    width , height = input_image.size
    input_image = input_image.crop((left , top , width - right , height - bottom))
    return input_image

def rotate_Image(input_image , angle):
    """Rotate the input image."""
    return input_image.rotate(angle)

def add_filter(input_image , filter:str):
    """Add filter to the input image."""
    if filter == 'BLUR':
        input_image = input_image.filter(ImageFilter.BLUR)
    elif filter == 'CONTOUR':
        input_image = input_image.filter(ImageFilter.CONTOUR)
    elif filter == 'DETAIL':
        input_image = input_image.filter(ImageFilter.DETAIL)
    elif filter == 'EDGE_ENHANCE':
        input_image = input_image.filter(ImageFilter.EDGE_ENHANCE)
    elif filter == 'EMBOSS':
        input_image = input_image.filter(ImageFilter.EMBOSS)
    elif filter == 'FIND_EDGES':
        input_image = input_image.filter(ImageFilter.FIND_EDGES)
    elif filter == 'SHARPEN':
        input_image = input_image.filter(ImageFilter.SHARPEN)
    return input_image

def add_watermark(input_image , watermark):
    """Add watermark to the input image."""
    width , height = input_image.size
    watermark = watermark.resize((width , height))
    input_image.paste(watermark , (0 , 0) , watermark)
    return input_image

def adjust_image_properties(input_image, brightness=1.0, contrast=1.0, saturation=1.0, what='brightness'):
    """
    Adjust the brightness, contrast, or saturation of an image.

    :param input_image: The PIL image to be processed.
    :param brightness: The brightness adjustment factor (default is 1.0, no change).
    :param contrast: The contrast adjustment factor (default is 1.0, no change).
    :param saturation: The saturation adjustment factor (default is 1.0, no change).
    :param what: The property to adjust ('brightness', 'contrast', or 'saturation').
    :return: The adjusted image.
    """
    if what == 'brightness':
        input_image = ImageEnhance.Brightness(input_image).enhance(brightness)
    elif what == 'contrast':
        input_image = ImageEnhance.Contrast(input_image).enhance(contrast)
    elif what == 'saturation':
        input_image = ImageEnhance.Color(input_image).enhance(saturation)
    else:
        raise ValueError("Invalid option for 'what'. Choose 'brightness', 'contrast', or 'saturation'.")

    return input_image

def enhance_image_opencv(input_image):
    """Enhance the input image using OpenCV."""
    open_cv_image = np.array(input_image)
    open_cv_image = cv2.cvtColor(open_cv_image, cv2.COLOR_RGB2BGR)

    #Apply the sharpening filter

    kernel = np.array([[0, -1, 0] , 
                       [-1 , 5 , -1],
                       [0 , -1 , 0]])
    
    open_cv_image = cv2.filter2D(src = open_cv_image , ddepth=-1 ,kernel =  kernel)

    open_cv_image = cv2.cvtColor(open_cv_image, cv2.COLOR_BGR2RGB)
    input_image = Image.fromarray(open_cv_image)
    return input_image


def add_to_history(image):
    """Save the current image state for undo/redo functionality."""
    with lock:
        if len(image_states) >= 10:  # Limit history to the last 10 states
            image_states.pop(0)
        image_states.append(image.copy())   

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    global image_states
    if request.method == 'POST':
        action = request.form.get('action')
        if 'file' not in request.files:
            return 'No file uploaded', 400
        file = request.files['file']
        if file.filename == '':
            return 'No file selected', 400
        
        if file:
            input_image = Image.open(file)

            # Determine the action from the form
            action = request.form.get('action')

            if action == 'remove_bg':
                output_image = remove_background(input_image)
                img_io = BytesIO()
                output_image.save(img_io, 'PNG')
                img_io.seek(0)
                return send_file(img_io, mimetype='image/png', as_attachment=True, download_name='outputImage.png')

            elif action == 'resize':
                width = int(request.form.get('width', 100))
                height = int(request.form.get('height', 100))
                output_image = resize_image(input_image, width, height)
                img_io = BytesIO()
                output_image.save(img_io, 'PNG')
                img_io.seek(0)
                return send_file(img_io, mimetype='image/png', as_attachment=True, download_name='resizedImage.png')

            elif action == 'compress':
                quality = int(request.form.get('quality', 75))
                img_io = compress_image(input_image, quality)
                return send_file(img_io, mimetype='image/jpeg', as_attachment=True, download_name='compressedImage.jpg')

            elif action == 'change_format':
                new_format = request.form.get('format', 'JPEG').upper()
                img_io = change_image_format(input_image, new_format)
                return send_file(img_io, mimetype=f'image/{new_format.lower()}', as_attachment=True, download_name=f'outputImage.{new_format.lower()}')
            elif action == 'crop':
                top = int(request.form.get('top', 0))
                bottom = int(request.form.get('bottom', 0))
                left = int(request.form.get('left', 0))
                right = int(request.form.get('right', 0))
                output_image = crop_Image(input_image , top , bottom , left , right)
                img_io = BytesIO()
                output_image.save(img_io, 'PNG')
                img_io.seek(0)
                return send_file(img_io, mimetype='image/png', as_attachment=True, download_name='croppedImage.png')
            elif action == 'rotate_Image':
                angle = int(request.form.get('angle', 0))
                output_image = rotate_Image(input_image , angle)
                img_io = BytesIO()
                output_image.save(img_io, 'PNG')
                img_io.seek(0)
                return send_file(img_io, mimetype='image/png', as_attachment=True, download_name='rotatedImage.png')
            elif action == 'add_filter':
                filter = request.form.get('filter', 'BLUR')
                output_image = add_filter(input_image , filter)
                img_io = BytesIO()
                output_image.save(img_io, 'PNG')
                img_io.seek(0)
                return send_file(img_io, mimetype='image/png', as_attachment=True, download_name='filteredImage.png')
            elif action == 'add_watermark':
                watermark = Image.open(request.files['watermark'])
                output_image = add_watermark(input_image , watermark)
                img_io = BytesIO()
                output_image.save(img_io, 'PNG')
                img_io.seek(0)
                return send_file(img_io, mimetype='image/png', as_attachment=True, download_name='watermarkedImage.png')
            elif action == 'adjust_properties':
                brightness = float(request.form.get('brightness', 1.0))
                contrast = float(request.form.get('contrast', 1.0))
                saturation = float(request.form.get('saturation', 1.0))
                what = request.form.get('what', 'brightness')
                output_image = adjust_image_properties(input_image, brightness, contrast, saturation, what)
                img_io = BytesIO()
                output_image.save(img_io, 'PNG')
                img_io.seek(0)
                return send_file(img_io, mimetype='image/png', as_attachment=True, download_name='adjustedImage.png')
            elif action == 'enhance_image':
                output_image = enhance_image_opencv(input_image)
                img_io = BytesIO()
                output_image.save(img_io, 'PNG')
                img_io.seek(0)
                return send_file(img_io, mimetype='image/png', as_attachment=True, download_name='enhancedImage.png')
            else:
                return 'Invalid action', 400

    return render_template('index.html')

@app.route('/undo', methods=['GET'])
def undo():
    """Undo the last action."""
    global image_states
    with lock:
        if len(image_states) > 1:
            image_states.pop()  # Remove the latest state
            img_io = BytesIO()
            image_states[-1].save(img_io, 'PNG')
            img_io.seek(0)
            return send_file(img_io, mimetype='image/png', as_attachment=True, download_name='undoImage.png')
        else:
            return jsonify({"error": "No more undo steps available"}), 400
        


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)
