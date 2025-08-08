import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import axios from 'axios';

const BatchProcessor = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processingOptions, setProcessingOptions] = useState({
    remove_bg: false,
    resize: false,
    compress: false,
    change_format: false
  });
  const [options, setOptions] = useState({
    width: 800,
    height: 600,
    quality: 75,
    format: 'JPEG'
  });

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.name.endsWith('.zip')) {
      setSelectedFile(file);
    } else {
      toast.error('Please select a ZIP file containing images');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip']
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

  const processBatch = async () => {
    if (!selectedFile) {
      toast.error('Please select a ZIP file first');
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
      formData.append('zip_file', selectedFile);
      
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

      const response = await axios.post('/batch', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `batch_processed_${selectedFile.name}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Batch processing completed successfully!');
    } catch (error) {
      console.error('Batch processing error:', error);
      toast.error('Error processing batch. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setProcessingOptions({
      remove_bg: false,
      resize: false,
      compress: false,
      change_format: false
    });
    setOptions({
      width: 800,
      height: 600,
      quality: 75,
      format: 'JPEG'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Batch Processor</h1>
        <p className="text-gray-600 mt-2">
          Process multiple images at once by uploading a ZIP file
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
            {selectedFile ? (
              <div className="space-y-4">
                <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetForm();
                  }}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove file
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
                    ? 'Drop the ZIP file here...'
                    : 'Drag and drop a ZIP file here, or click to select'}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  ZIP file containing images (PNG, JPG, GIF, BMP, WebP)
                </p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Instructions</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Create a ZIP file containing your images</li>
              <li>• Supported formats: PNG, JPG, GIF, BMP, WebP</li>
              <li>• Maximum file size: 50MB</li>
              <li>• Processing time depends on number of images</li>
              <li>• You'll receive a ZIP file with processed images</li>
            </ul>
          </div>
        </div>

        {/* Processing Options */}
        <div className="space-y-6">
          {/* Processing Options */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Processing Options
            </h3>
            
            <div className="space-y-4">
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
              </div>
            </div>
          </div>

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

          {/* Process Button */}
          <div className="bg-white rounded-lg shadow p-6">
            <button
              onClick={processBatch}
              disabled={!selectedFile || processing}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing batch...
                </div>
              ) : (
                'Process Batch'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchProcessor; 