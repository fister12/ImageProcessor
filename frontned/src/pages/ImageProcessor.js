import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import axios from 'axios';

const ImageProcessor = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processingOptions, setProcessingOptions] = useState({
    remove_bg: false,
    resize: false,
    compress: false,
    change_format: false,
    crop: false,
    rotate: false,
    add_filter: false,
    add_watermark: false,
    adjust_properties: false,
    enhance_image: false
  });
  const [options, setOptions] = useState({
    width: 800,
    height: 600,
    quality: 75,
    format: 'JPEG',
    angle: 90,
    filter: 'BLUR',
    brightness: 1.0,
    contrast: 1.0,
    saturation: 1.0,
    crop_top: 0,
    crop_bottom: 0,
    crop_left: 0,
    crop_right: 0
  });

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: false
  });

  const handleOptionChange = (option) => {
    setProcessingOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleInputChange = (field, value) => {
    setOptions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const processImage = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    const hasAnyOption = Object.values(processingOptions).some(option => option);
    if (!hasAnyOption) {
      toast.error('Please select at least one processing option');
      return;
    }

    setProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Add processing options
      Object.keys(processingOptions).forEach(option => {
        if (processingOptions[option]) {
          formData.append(option, 'true');
        }
      });

      // Add option values
      Object.keys(options).forEach(key => {
        formData.append(key, options[key]);
      });

      const response = await axios.post('/', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `processed_${selectedFile.name}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Image processed successfully!');
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Error processing image. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setProcessingOptions({
      remove_bg: false,
      resize: false,
      compress: false,
      change_format: false,
      crop: false,
      rotate: false,
      add_filter: false,
      add_watermark: false,
      adjust_properties: false,
      enhance_image: false
    });
    setOptions({
      width: 800,
      height: 600,
      quality: 75,
      format: 'JPEG',
      angle: 90,
      filter: 'BLUR',
      brightness: 1.0,
      contrast: 1.0,
      saturation: 1.0,
      crop_top: 0,
      crop_bottom: 0,
      crop_left: 0,
      crop_right: 0
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Image Processor</h1>
        <p className="text-gray-600 mt-2">
          Upload an image and apply various processing options
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            {preview ? (
              <div className="space-y-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full h-64 object-contain mx-auto rounded-lg"
                />
                <p className="text-sm text-gray-600">
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetForm();
                  }}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove image
                </button>
              </div>
            ) : (
              <div>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  {isDragActive
                    ? 'Drop the image here...'
                    : 'Drag and drop an image here, or click to select'}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG, GIF, BMP, WebP up to 10MB
                </p>
              </div>
            )}
          </div>

          {/* Processing Options */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Processing Options
            </h3>
            
            <div className="space-y-4">
              {/* Basic Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={processingOptions.remove_bg}
                    onChange={() => handleOptionChange('remove_bg')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Remove Background</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={processingOptions.resize}
                    onChange={() => handleOptionChange('resize')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Resize</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={processingOptions.compress}
                    onChange={() => handleOptionChange('compress')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Compress</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={processingOptions.change_format}
                    onChange={() => handleOptionChange('change_format')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Change Format</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={processingOptions.rotate}
                    onChange={() => handleOptionChange('rotate')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Rotate</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={processingOptions.enhance_image}
                    onChange={() => handleOptionChange('enhance_image')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enhance Image</span>
                </label>
              </div>

              {/* Advanced Options */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Advanced Options</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={processingOptions.crop}
                      onChange={() => handleOptionChange('crop')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Crop</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={processingOptions.add_filter}
                      onChange={() => handleOptionChange('add_filter')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Add Filter</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={processingOptions.adjust_properties}
                      onChange={() => handleOptionChange('adjust_properties')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Adjust Properties</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Options Configuration */}
        <div className="space-y-6">
          {/* Resize Options */}
          {processingOptions.resize && (
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Resize Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Width</label>
                  <input
                    type="number"
                    value={options.width}
                    onChange={(e) => handleInputChange('width', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Height</label>
                  <input
                    type="number"
                    value={options.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Compress Options */}
          {processingOptions.compress && (
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Compression Settings</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quality ({options.quality}%)</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={options.quality}
                  onChange={(e) => handleInputChange('quality', e.target.value)}
                  className="mt-1 block w-full"
                />
              </div>
            </div>
          )}

          {/* Format Options */}
          {processingOptions.change_format && (
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Format Settings</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700">Output Format</label>
                <select
                  value={options.format}
                  onChange={(e) => handleInputChange('format', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="JPEG">JPEG</option>
                  <option value="PNG">PNG</option>
                  <option value="WEBP">WebP</option>
                  <option value="BMP">BMP</option>
                </select>
              </div>
            </div>
          )}

          {/* Rotate Options */}
          {processingOptions.rotate && (
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Rotation Settings</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700">Angle (degrees)</label>
                <input
                  type="number"
                  value={options.angle}
                  onChange={(e) => handleInputChange('angle', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          )}

          {/* Filter Options */}
          {processingOptions.add_filter && (
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Filter Settings</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700">Filter Type</label>
                <select
                  value={options.filter}
                  onChange={(e) => handleInputChange('filter', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="BLUR">Blur</option>
                  <option value="SHARPEN">Sharpen</option>
                  <option value="EDGE_ENHANCE">Edge Enhance</option>
                  <option value="EMBOSS">Emboss</option>
                </select>
              </div>
            </div>
          )}

          {/* Adjust Properties Options */}
          {processingOptions.adjust_properties && (
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Adjustment Settings</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Brightness ({options.brightness})
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={options.brightness}
                    onChange={(e) => handleInputChange('brightness', e.target.value)}
                    className="mt-1 block w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contrast ({options.contrast})
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={options.contrast}
                    onChange={(e) => handleInputChange('contrast', e.target.value)}
                    className="mt-1 block w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Saturation ({options.saturation})
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={options.saturation}
                    onChange={(e) => handleInputChange('saturation', e.target.value)}
                    className="mt-1 block w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Process Button */}
          <div className="bg-white rounded-lg shadow p-6">
            <button
              onClick={processImage}
              disabled={!selectedFile || processing}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                'Process Image'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageProcessor; 