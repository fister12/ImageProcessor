// Cache DOM elements for better performance
const fileDropArea = document.querySelector('.file-drop-area');
const fileInput = document.getElementById('file');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const result = document.getElementById('result');
const resultImage = document.getElementById('result-image');

// Cache element lookup map for toggleInputGroup
const ELEMENT_MAP = {
    resize: ['resize-width', 'resize-height'],
    compress: ['compress-quality'],
    change_format: ['change-format'],
    crop: ['crop-top', 'crop-bottom', 'crop-left', 'crop-right'],
    rotate: ['rotate-angle'],
    filter: ['add-filter']
};

fileDropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileDropArea.classList.add('border-secondary'); // Highlight on drag over
});

fileDropArea.addEventListener('dragleave', () => {
    fileDropArea.classList.remove('border-secondary'); // Remove highlight on drag leave
});

fileDropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileDropArea.classList.remove('border-secondary'); // Remove highlight on drop
    const files = e.dataTransfer.files;
    handleFilePreview(files[0]);
});

function handleFileInput(event) {
    const files = event.target.files;
    handleFilePreview(files[0]);
}

function handleFilePreview(file) {
    if (!file) {
        imagePreview.src = '';
        imagePreviewContainer.classList.add('hidden');
        return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        alert('File size exceeds 10MB limit');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        imagePreview.src = e.target.result;
        imagePreviewContainer.classList.remove("hidden");
        result.classList.add("hidden");
        resultImage.src = '';
    };
    reader.onerror = function() {
        alert('Error reading file');
    };
    reader.readAsDataURL(file);
}

function toggleInputGroup(group) {
    const elementIds = ELEMENT_MAP[group];
    if (!elementIds) return;
    
    const actionElement = document.getElementById(`action-${group}`);
    if (!actionElement) return;
    
    const isChecked = actionElement.checked;
    elementIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (isChecked) {
                element.removeAttribute('readonly');
            } else {
                element.setAttribute('readonly', true);
            }
        }
    });
}
let blob;
function modifyImage(event) {
    event.preventDefault();
    
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton?.textContent;
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';
    }
    
    const formData = new FormData(event.target);
    
    fetch("/", {
        method: "POST",
        body: formData
    })
    .then(async response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        // Clean up previous blob URL to prevent memory leaks
        if (resultImage.src && resultImage.src.startsWith('blob:')) {
            URL.revokeObjectURL(resultImage.src);
        }
        
        resultImage.src = url;
        result.classList.remove("hidden");
        
        // Smooth scroll to result
        result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    })
    .catch(error => {
        console.error('Error processing image:', error);
        alert('Error processing image. Please try again.');
    })
    .finally(() => {
        if (submitButton) {
            submitButton.disabled = false;
            if (originalText) {
                submitButton.textContent = originalText;
            }
        }
    });
}

function generateNewFileName(originalFileName, actions) {
    // Extract the file name and extension
    const lastDotIndex = originalFileName.lastIndexOf('.');
    const baseName = originalFileName.slice(0, lastDotIndex);

    // Start building the new file name
    let newFileName = baseName;

    // Append action-specific tags
    if (actions.remove_bg) {
        newFileName += "_noBG";
    }
    if (actions.resize) {
        newFileName += `_resize_${actions.width || 'auto'}x${actions.height || 'auto'}`;
    }
    if (actions.compress) {
        newFileName += `_compressed_${actions.quality || 'default'}%`;
    }
    if (actions.change_format) {
        newFileName += `_to${actions.format || extension.toUpperCase()}`;
    }
    if (actions.crop) {
        newFileName += `_crop_${actions.top || 0}-${actions.bottom || 0}-${actions.left || 0}-${actions.right || 0}`;
    }
    if (actions.rotate) {
        newFileName += `_rotate_${actions.angle || 0}deg`;
    }
    if (actions.filter) {
        newFileName += `_filter_${actions.filter || 'none'}`;
    }

    // Add the final extension (change if needed)
    const finalExtension = actions.change_format ? actions.format.toLowerCase() : blob.type.split("/")[1];
    newFileName += `.${finalExtension}`;

    return newFileName;
}

function downloadImage() {
    if (!blob || !fileInput.files[0]) {
        alert('No image to download');
        return;
    }
    
    const a = document.createElement("a");
    a.href = resultImage.src;
    a.download = generateNewFileName(fileInput.files[0].name, {
        remove_bg: document.getElementById("action-remove_bg")?.checked || false,
        resize: document.getElementById("action-resize")?.checked || false,
        width: document.getElementById("resize-width")?.value || '',
        height: document.getElementById("resize-height")?.value || '',
        compress: document.getElementById("action-compress")?.checked || false,
        quality: document.getElementById("compress-quality")?.value || '',
        change_format: document.getElementById("action-change_format")?.checked || false,
        format: document.getElementById("change-format")?.value || '',
        crop: document.getElementById("action-crop")?.checked || false,
        top: document.getElementById("crop-top")?.value || 0,
        bottom: document.getElementById("crop-bottom")?.value || 0,
        left: document.getElementById("crop-left")?.value || 0,
        right: document.getElementById("crop-right")?.value || 0,
        rotate: document.getElementById("action-rotate")?.checked || false,
        angle: document.getElementById("rotate-angle")?.value || 0,
        filter: document.getElementById("action-filter")?.checked ? document.getElementById("add-filter")?.value : null,
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}