from flask import Blueprint, request, send_file, render_template, jsonify
from PIL import Image
from io import BytesIO
from utils.image_processing import (
    remove_background, resize_image, compress_image, change_image_format,
    crop_Image, rotate_Image, add_filter, add_watermark, 
    adjust_image_properties, enhance_image_opencv, add_to_history
)
from utils.state_manager import get_image_states, get_lock

image_process_bp = Blueprint('image_process', __name__)

@image_process_bp.route('/', methods=['GET', 'POST'])
def upload_file():
    image_states = get_image_states()
    if request.method == 'POST':
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if file:
            try:
                input_image = Image.open(file)
                imageExtension = "jpeg"

                # Process tasks sequentially
                if request.form.get('remove_bg'):
                    input_image = remove_background(input_image)

                if request.form.get('resize'):
                    width = int(request.form.get('width', 100))
                    height = int(request.form.get('height', 100))
                    input_image = resize_image(input_image, width, height)

                if request.form.get('compress'):
                    quality = int(request.form.get('quality', 75))
                    input_image = compress_image(input_image, quality)

                if request.form.get('change_format'):
                    new_format = request.form.get('format', 'JPEG').upper()
                    imageExtension = new_format.lower()
                    input_image = change_image_format(input_image, new_format)

                if request.form.get('crop'):
                    top = int(request.form.get('top', 0))
                    bottom = int(request.form.get('bottom', 0))
                    left = int(request.form.get('left', 0))
                    right = int(request.form.get('right', 0))
                    input_image = crop_Image(input_image, top, bottom, left, right)

                if request.form.get('rotate'):
                    angle = int(request.form.get('angle', 0))
                    input_image = rotate_Image(input_image, angle)

                if request.form.get('add_filter'):
                    filter_name = request.form.get('filter', 'BLUR')
                    input_image = add_filter(input_image, filter_name)

                if request.form.get('add_watermark'):
                    if 'watermark' in request.files:
                        watermark = Image.open(request.files['watermark'])
                        input_image = add_watermark(input_image, watermark)

                if request.form.get('adjust_properties'):
                    brightness = float(request.form.get('brightness', 1.0))
                    contrast = float(request.form.get('contrast', 1.0))
                    saturation = float(request.form.get('saturation', 1.0))
                    what = request.form.get('what', 'brightness')
                    input_image = adjust_image_properties(input_image, brightness, contrast, saturation, what)

                if request.form.get('enhance_image'):
                    input_image = enhance_image_opencv(input_image)

                # Add to history before saving
                add_to_history(input_image, image_states)

                # Save and return the final image
                img_io = BytesIO()
                input_image.save(img_io, imageExtension.upper())
                img_io.seek(0)
                return send_file(img_io, mimetype=f'image/{imageExtension}', as_attachment=True, download_name=f'outputImage.{imageExtension}')
            
            except Exception as e:
                return jsonify({"error": f"Processing failed: {str(e)}"}), 500

    return jsonify({"message": "Image processing endpoint"}), 200

@image_process_bp.route('/undo', methods=['GET'])
def undo():
    """Undo the last action."""
    image_states = get_image_states()
    lock = get_lock()
    with lock:
        if len(image_states) > 1:
            image_states.pop()  # Remove the latest state
            img_io = BytesIO()
            image_states[-1].save(img_io, 'PNG')
            img_io.seek(0)
            return send_file(img_io, mimetype='image/png', as_attachment=True, download_name='undoImage.png')
        else:
            return jsonify({"error": "No more undo steps available"}), 400