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
async def upload_file():
    image_states = get_image_states()
    if request.method == 'POST':
        if 'file' not in request.files:
            return 'No file uploaded', 400
        file = request.files['file']
        if file.filename == '':
            return 'No file selected', 400
        
        if file:
            input_image = Image.open(file)
            imageExtension = "jpeg"

            # Process tasks sequentially
            if request.form.get('remove_bg'):
                input_image = await remove_background(input_image)

            if request.form.get('resize'):
                width = int(request.form.get('width', 100))
                height = int(request.form.get('height', 100))
                input_image = await resize_image(input_image, width, height)

            if request.form.get('compress'):
                quality = int(request.form.get('quality', 75))
                input_image = await compress_image(input_image, quality)

            if request.form.get('change_format'):
                new_format = request.form.get('format', 'JPEG').upper()
                imageExtension = new_format.lower()
                input_image = await change_image_format(input_image, new_format)

            if request.form.get('crop'):
                top = int(request.form.get('top', 0))
                bottom = int(request.form.get('bottom', 0))
                left = int(request.form.get('left', 0))
                right = int(request.form.get('right', 0))
                input_image = await crop_Image(input_image, top, bottom, left, right)

            if request.form.get('rotate'):
                angle = int(request.form.get('angle', 0))
                input_image = await rotate_Image(input_image, angle)

            if request.form.get('add_filter'):
                filter_name = request.form.get('filter', 'BLUR')
                input_image = await add_filter(input_image, filter_name)

            if request.form.get('add_watermark'):
                if 'watermark' in request.files:
                    watermark = Image.open(request.files['watermark'])
                    input_image = await add_watermark(input_image, watermark)

            if request.form.get('adjust_properties'):
                brightness = float(request.form.get('brightness', 1.0))
                contrast = float(request.form.get('contrast', 1.0))
                saturation = float(request.form.get('saturation', 1.0))
                what = request.form.get('what', 'brightness')
                input_image = await adjust_image_properties(input_image, brightness, contrast, saturation, what)

            if request.form.get('enhance_image'):
                input_image = await enhance_image_opencv(input_image)

            # Add to history before saving
            await add_to_history(input_image, image_states)

            # Save and return the final image
            img_io = BytesIO()
            input_image.save(img_io, imageExtension.upper())
            img_io.seek(0)
            return send_file(img_io, mimetype=f'image/{imageExtension}', as_attachment=True, download_name=f'outputImage.{imageExtension}')

    return render_template('index.html')

@image_process_bp.route('/undo', methods=['GET'])
async def undo():
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