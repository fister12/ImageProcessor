import unittest
from PIL import Image
import asyncio
from io import BytesIO
from app import remove_background, resize_image, compress_image, change_image_format, crop_Image, rotate_Image, add_filter

class TestImageProcessing(unittest.TestCase):
    def setUp(self):
        self.image = Image.new('RGB', (200, 200), color = 'red')

    def test_remove_background(self):
        result = asyncio.run(remove_background(self.image))
        self.assertIsInstance(result, Image.Image)

    def test_resize_image(self):
        result = asyncio.run(resize_image(self.image, 100, 100))
        self.assertIsInstance(result, Image.Image)

    def test_compress_image(self):
        result = asyncio.run(compress_image(self.image, 100))
        self.assertIsInstance(result, Image.Image)

    def test_change_image_format(self):
        result = asyncio.run(change_image_format(self.image, 'JPEG'))
        self.assertIsInstance(result, Image.Image)

    def test_crop_Image(self):
        result = asyncio.run(crop_Image(self.image, 10, 10, 10, 10))
        self.assertIsInstance(result, Image.Image)

    def test_rotate_Image(self):
        result = asyncio.run(rotate_Image(self.image, 90))
        self.assertIsInstance(result, Image.Image)

    def test_add_filter(self):
        result = asyncio.run(add_filter(self.image, 'BLUR'))
        self.assertIsInstance(result, Image.Image)

if __name__ == '__main__':
    unittest.main()